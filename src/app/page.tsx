'use client'

import { useEffect, useRef, useState } from "react"
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

interface User {
  userCd: string;
  userName: string;
}

export default function Home() {
  const db = useRef<any | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userCd, setUserCd] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    (async () => {
      try {
        const sqlite3 = await sqlite3InitModule()
        const oo = sqlite3.oo1;
        if (sqlite3.opfs) {
          console.log('Opfs is available')
          db.current = new sqlite3.opfs.OpfsDb("/db.sqlite3")
        } else {
          console.log('Opfs is not available')
          db.current = new oo.DB("/db.sqlite3", "ct")
        }
        db.current.exec("CREATE TABLE IF NOT EXISTS test (user_cd VARCHAR(20) PRIMARY KEY, user_name VARCHAR(50));")
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const onClickFetchUsers = async () => {
    try {
      const res = await db.current.exec({sql: "SELECT * FROM test;", rowMode: "object"})
      setUsers(res.map((user: any) => ({userCd: user.user_cd, userName: user.user_name})))
    } catch (err) {
      console.error(err)
    }
  }

  const onClickAddUser = async () => {
    try {
      await db.current.exec({
        sql: "INSERT INTO test (user_cd, user_name) VALUES ($user_cd, $user_name);",
        bind: {
          $user_cd: userCd,
          $user_name: userName,
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const onClickTruncateUsers = async () => {
    try {
      await db.current.exec({sql: "DELETE FROM test;"})
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem"}}>
      <div>userCd <input value={userCd} onChange={(e) => setUserCd(e.target.value)}></input></div>
      <div>userName <input value={userName} onChange={(e) => setUserName(e.target.value)}></input></div>
      <div style={{display: "flex", gap: "0.5rem"}}>
        <button onClick={onClickAddUser}>Add User</button>
        <button onClick={onClickFetchUsers}>Fetch Users</button>
        <button onClick={onClickTruncateUsers}>Truncate Users</button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.userCd}>{user.userCd}: {user.userName}</li>
        ))}
      </ul>
    </div>
  )
}
