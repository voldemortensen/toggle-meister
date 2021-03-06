import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { TableRow, TableCell, TableBody, Paper, IconButton, Icon } from '@material-ui/core'
import CreateEditReleaseNote from '../create-edit/create-edit.component.js'
import ReleaseNoteInlinePreview from './release-note-inline-preview.component.js'
import DeleteReleaseNote from '../delete/delete-note.component.js'

const useStyles = makeStyles(theme => ({
  flex: {
    display: 'flex'
  }
}))

export default function ReleaseNoteRow (props) {
  const { note = {}, refetch } = props
  const classes = useStyles()
  const { title, body, feature} = note
  const [edit, setEdit] = useState(false)
  const [ showDelete, setDelete ] = useState(false)
  return (
    <TableRow key={note.id}>
      <TableCell>
        {title}
      </TableCell>
      <TableCell>
        <ReleaseNoteInlinePreview markdown={body} />
      </TableCell>
      <TableCell>
        {feature}
      </TableCell>
      <TableCell >
        <div className={classes.flex}>
          <IconButton onClick={() => setEdit(!edit)}>
            <Icon>
              edit
            </Icon>
          </IconButton>
          <IconButton onClick={() => setDelete(!showDelete)}>
            <Icon>
              delete
            </Icon>
          </IconButton>
        </div>
      </TableCell>
      {
        edit && (
          <CreateEditReleaseNote
            releaseNote={note}
            close={() => setEdit(false)}
            onSuccess={refetch}
          />
        )
      }
      {
        showDelete && (
          <DeleteReleaseNote
            note={note}
            refetch={refetch}
            close={() => setDelete(false)}
          />
        )
      }
    </TableRow>
  )
}

