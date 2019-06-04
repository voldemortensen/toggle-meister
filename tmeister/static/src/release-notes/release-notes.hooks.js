import { useState, useEffect } from 'react'
import { uniqueId } from 'lodash'

export function useFetchReleaseNotes () {
  const [ notes, setNotes ] = useState([])
  const [ loadingNotes, setLoadingNotes ] = useState(false)
  const [ count, setCount ] = useState(1)

  useEffect(() => {
    //mock fetch
    setLoadingNotes(true)
    Promise.resolve(mockResults())
      .then((response) => {
        if (response) {
          setNotes(response.releaseNotes)
          setLoadingNotes(false)
        }
      }).catch(err => {
        setNotes([])
        setLoadingNotes(false)
      })
  }, [count])

  return [
    loadingNotes,
    notes,
    () => setCount(count + 1)
  ]
}

export function useCreateEditReleaseNote(isEdit) {
  const [ note, setNote ] = useState()
  const [ requestInProgress, setRequestInProgress] = useState(false)
  const [ response, setResponse] = useState()
  useEffect(() => {
    if (note) {
      setRequestInProgress(true)
      const req = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({id: uniqueId(), ...note})
        }, 2000)
      })
      req.then(r => {
        setResponse(r)
        setRequestInProgress(false)
      })
      return () => {}
    }
  }, [note, isEdit])

  return [setNote, requestInProgress, response]
}


function mockResults() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        releaseNotes: [
          {id: 1, title: 'Single Spa',
            body: mockNote(),
            relatedToggles: ['single-spa']
          },
          {id: 2, title: 'General Kenobi,', body: '', relatedToggles: []},
          {id: 3, title: 'You are a bold one', body: '', relatedToggles: []},
        ]
      })

    }, 2000)
  })
}

function mockNote () {
  return `## A javascript metaframework

Build micro frontends that coexist and can each be written with their own framework. This allows you to:
- [Use multiple frameworks](/docs/single-spa-ecosystem.md#help-for-frameworks) on the same page [without refreshing the page](/docs/applications.md)
  ([React](https://github.com/CanopyTax/single-spa-react), [AngularJS](https://github.com/CanopyTax/single-spa-angular1), [Angular](https://github.com/CanopyTax/single-spa-angular2), [Ember](https://github.com/CanopyTax/single-spa-ember), or whatever you're using)
- Write code using a new framework, without rewriting your existing app
- Lazy load code for improved initial load time.

## Documentation

You can find the single-spa documentation [on the website](https://single-spa.js.org/).  

Check out the [Getting Started](https://single-spa.js.org/docs/getting-started-overview.html) page for a quick overview.

## Demo and examples

A [live demo](https://single-spa.surge.sh) is available and the source code for that demo is available in the [single-spa-examples](https://github.com/CanopyTax/single-spa-examples) repository.

Also, you can check out [a simple webpack starter project](https://github.com/joeldenning/simple-single-spa-webpack-example) which is simpler and hopefully easier to get started with.

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for [contributing](https://single-spa.js.org/docs/contributing-overview.html) on the [single-spa website](https://single-spa.js.org).

## Project roadmap

We're trying out github's Projects feature ([here](https://github.com/CanopyTax/single-spa/projects)) and are keeping it up-to-date with the fancy things in the works for single-spa.

## Contributing

The main purpose of this repository is to continue to evolve single-spa, making it better and easier to use. Development of single-spa, and the [single-spa ecosystem](https://single-spa.js.org/docs/ecosystem.html) happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving single-spa.

### [Code of Conduct](https://single-spa.js.org/docs/code-of-conduct.html)

Single-spa has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://single-spa.js.org/docs/code-of-conduct.html) so that you can understand what actions will and will not be tolerated.

### [Contributing Guide](https://single-spa.js.org/docs/contributing-overview.html)

Read our [contributing guide](https://single-spa.js.org/docs/contributing-overview.html) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to single-spa.
  `
}
