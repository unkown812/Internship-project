import React, { useState } from 'react'
import supabase from '../lib/supabase'

function AddUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('users')  // your table name
      .insert([
        { name: name, email: email }
      ])

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('User added successfully!')
      setName('')
      setEmail('')
    }
  }

  return (
    <div>
      <h2>Add User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <p>{message}</p>
    </div>
  )
}

export default AddUser
