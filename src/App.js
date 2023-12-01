import Note from './components/Note'
import { useState, useEffect } from 'react'
import axios from 'axios'
import noteService from './services/notes'


const App = () => {
  const [notes, setNotes] = useState([])

  const [newNote, setNewNote] = useState(
    'a new note...'
  )
  const [showAll, setShowAll] = useState(true)

  //const promise = axios.get('http://localhost:3001/notes')
  //console.log("la promesa bro", promise)
  const toggleImportanceOf = id => {
    //const url = `http://localhost:3001/notes/${id}`
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
    noteService.update(id, changedNote).then(returnedNote  => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote))
    }).catch(error =>console.log('fallo')).then(console.log('otro then porque puedo agregar tantos then como quiera para un mismo catch')).catch(error => {
      alert(
        `the note '${note.content}' was already deleted from server`
      )
      setNotes(notes.filter(n => n.id !== id))
    })//aqui no usamos el response.data porque desde el service ya lo implemente
    //coloco un catch en el then para atrapar el error o al final de todo para atrapar el error de alguno de ellos, aunque lo más común es colocarlo al final
  }


  const hook = () => {
    /*console.log('effect')
    axios
      .get('http://localhost:3001/notes')
      .then(response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      })*/
      console.log('effect')

      const eventHandler = response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      }
    
      //const promise = axios.get('http://localhost:3001/notes')
      //promise.then(eventHandler)

      noteService.getAll().then(data =>{
        setNotes(data);
      });
  }
  //puedes meter la función directo en el hook en lugar de definir eso como una variable.
  useEffect(hook, [])

  console.log('render', notes.length, 'notes')


  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      date: new Date().toISOString(),
      important: Math.random() < 0.5,
      //id: notes.length + 1, lo comento ya que es mejor dejar que el servidor genere identificadores para nuestros recursos
    }


    noteService
    .create(noteObject)
    .then(response => {
      setNotes(notes.concat(response.data))
      setNewNote('')
    })

  }
  const handleNoteChange = (event) => {
    console.log(event.target.value)
    setNewNote(event.target.value)
  }

  const notesToShow = showAll
  ? notes
  : notes.filter(note => note.important === true)

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>
      <ul>
        {notesToShow.map(note => 
          <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)}/>
        )}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange}/>
        <button type="submit">save</button>
      </form> 
    </div>
  )
}

export default App