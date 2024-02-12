import Note from './components/Note'
import { useState, useEffect } from 'react'
import noteService from './services/notes'
import loginService from './services/login'
import Notification from './components/Notification'
import Footer from './components/Footer'


const App = () => {
  const [notes, setNotes] = useState([])

  const [newNote, setNewNote] = useState(
    'a new note...'
  )
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)


  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, password,
      })
      console.log('data del login',user)
      noteService.setToken(user.token)
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )// guardamos la respuesta del back que contiene el token, lo guardamos en cache para cuando reinicie la pagina no deba volver a iniciar sesión--> Usamos JSON.stringify() porque el setItem() no reconoce objetos, así que lo volvemos json.  
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  //const promise = axios.get('http://localhost:3001/notes')
  //console.log("la promesa bro", promise)
  const toggleImportanceOf = id => {
    //const url = `http://localhost:3001/notes/${id}`
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
    noteService.update(id, changedNote).then(returnedNote  => {
      setNotes(notes.map(note => note.id !== id ? note : returnedNote))
    }).then(console.log('otro then porque puedo agregar tantos then como quiera para un mismo catch')).catch(error => {
      setErrorMessage(
        `Note '${note.content}' was already removed from server`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
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
      }).catch(error =>{
        console.log(error)
        setErrorMessage(
          `error '${error.code}'`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      });
  }
  //puedes meter la función directo en el hook en lugar de definir eso como una variable.
  useEffect(hook, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, []) //apenas se reinicie la pagina revisamos el cache para ver si hay un token. Si el token existe, se realiza el inicio de sesión automatico

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

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>      
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input
        value={newNote}
        onChange={handleNoteChange}
      />
      <button type="submit">save</button>
    </form>  
  )

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      {user === null && loginForm()}
      {user !== null && 
        <div>
          <p>{user.name} logged in</p>
          {noteForm()}
        </div>
      }
      
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
      <Footer/>
    </div>
  )
}

export default App