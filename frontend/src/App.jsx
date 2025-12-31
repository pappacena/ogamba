import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items/`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, completed: false }),
      })
      if (response.ok) {
        setTitle('')
        setDescription('')
        fetchItems()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  return (
    <div className="container">
      <h1>Item List</h1>

      <form onSubmit={addItem} className="item-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Item</button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span>{item.completed ? '✅ Completed' : '⏳ Pending'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
