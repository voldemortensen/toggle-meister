import time
import os
from datetime import datetime

import sqlalchemy
import schedule
import requests


SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
SLACK_CHANNEL = os.getenv('SLACK_CHANNEL')
SLACK_USERNAME = os.getenv('SLACK_USERNAME')
SLACK_REMINDER_DAY = os.getenv('SLACK_REMINDER_DAY', 'wednesday')
SLACK_REMINDER_TIME = os.getenv('SLACK_REMINDER_TIME', '16:00')
ICON_URL = os.getenv('SLACK_ICON_URL')


def get_database_url():
    POSTGRES_URL = os.getenv('DATABASE_URL', 'localhost')
    POSTGRES_USERNAME = os.getenv('DATABASE_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('DATABASE_PASS', 'password')
    POSTGRES_DB_NAME = os.getenv('DATABASE_DB_NAME', 'postgres')

    url = 'postgres://{user}:{password}@{host}/{db}'.format(
        user=POSTGRES_USERNAME,
        password=POSTGRES_PASSWORD,
        host=POSTGRES_URL,
        db=POSTGRES_DB_NAME
    )
    return url


def get_production_toggles():
    pg = sqlalchemy.create_engine(get_database_url())
    toggles = pg.execute("SELECT feature, date_on FROM toggles "
                         "WHERE env = 'Production' and state = 'ON' and "
                         "DATE_PART('day', now() - date_on) > 14")

    features = []
    for feature, date_on in toggles:
        _, user = next(pg.execute(f"SELECT name, created_by FROM features WHERE name = '{feature}';"))
        features.append((feature, user, date_on))

    return features


def report_to_slack():
    toggs = get_production_toggles()
    for feature, user, date in toggs:
        message = f'Feature {feature} created by {user} has been on production since {date}. ' \
            f'Time to clean that up.'
        if SLACK_WEBHOOK_URL:
            slack_message = {
                'text': message
            }
            if SLACK_CHANNEL:
                slack_message['channel'] = SLACK_CHANNEL
            if SLACK_USERNAME:
                slack_message['username'] = SLACK_USERNAME
            if ICON_URL:
                slack_message['icon_url'] = ICON_URL
            try:
                req = requests.post(SLACK_WEBHOOK_URL, json=slack_message)
                if req.status_code in (200, 201, 202, 204):
                    print('successfully sent slack notification')
                else:
                    print('received error code {} with response: {}'
                          .format(req.status_code, req.text))
            except (ConnectionError, requests.HTTPError) as e:
                print('Sending logs to slack failed: {}'
                      .format(e))
            except Exception as e:
                print('Something crazy happened sending logs to slack: {}'
                      .format(e))
        else:
            print(message)


def run():
    report_to_slack()
    s = schedule.every(1).week
    s.start_day = SLACK_REMINDER_DAY
    s.at(SLACK_REMINDER_TIME).do(report_to_slack)

    while True:
        sleep_time = schedule.next_run() - datetime.now()
        print(f'Next job to run at {schedule.next_run()}, which is {str(sleep_time)} from now.')
        time.sleep(max(1, sleep_time.seconds))
        schedule.run_pending()
