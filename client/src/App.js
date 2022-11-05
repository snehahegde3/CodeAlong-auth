import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import axios from 'axios';
import { useEffect, useState } from 'react';

//user context
// import { UserContext } from './Context';

function App() {
  const [user, setUser] = useState(null);
  const getUser = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/auth/login/success`;
      const { data } = await axios.get(url, { withCredentials: true });
      setUser(data.user._json);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser();
    // console.log(user);
  }, []);

  // const userHandler = (user) => {
  //   setUser(user);
  //   console.log(user);
  // };
  // console.log('outside', user);
  // console.log(process.env);

  return (
    <>
      <div>
        <Toaster
          position='top-center'
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home user={user} />}></Route>
          <Route
            path='/editor/:roomId'
            element={<EditorPage user={user} />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
