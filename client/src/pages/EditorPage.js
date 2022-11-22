import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
  useLocation,
  useNavigate,
  Navigate,
  //useParams to get the roomId as parameter from params
  useParams,
} from 'react-router-dom';

const EditorPage = (props) => {
  //useRef does not cause rerendering of the component
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState('');

  // function addlist() {
  //   var select = document.getElementById('language');
  //   for (let key in languageList) {
  //     var option = document.createElement('option');
  //     option.text = key;
  //     option.value = languageList[key];
  //     select.add(option);
  //   }
  // }

  //for initialisation of the socket-client
  useEffect(() => {
    // addlist();
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        //on error
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      // socketRef.current.on('load-code', ({ roomId, roomCode }) => {
      //   codeRef.current = roomCode;
      // });

      //this is emitted and listened to on the server side
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId, code }) => {
          // only notify if he is not the new user that joined
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);

          // so a new user gets all the previous code when he joins for the first time
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: code || codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    // cleaning function
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  async function copyRoomId() {
    try {
      // inbuilt navigator.clipboard
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  // async function compileIt() {
  //   document.getElementById('opscreen').style.visibility = 'visible';

  //   var response = await fetch('http://localhost:8080/editor/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'text/plain',
  //     },
  //     body: JSON.stringify({
  //       code: codeRef.current,
  //       language: document.querySelector('#language').value,
  //       standardIn: document
  //         .querySelector('#stdin')
  //         .value.split(/[|]+/)
  //         .join('\n'),
  //     }),
  //   })
  //     .then((response) => {
  //       console.log(response);
  //       return response.json();
  //     })
  //     .then((data) => {
  //       // setOutput(data);
  //     })
  //     .catch((error) => alert(error.message));
  // }

  async function leaveRoom(e) {
    if (props.user) {
      window.open(`${process.env.REACT_APP_API_URL}/auth/logout`, '_self');
    }

    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to='/' />;
  }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <div className='logo'>
            <img className='logoImage' src='/cover.png' alt='logo' />
          </div>
          <h3>Connected</h3>
          <div className='clientsList'>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className='btn leaveBtn' onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className='editorWrap'>
        <div className='actions'>
          <div className='actions__container-fluid'>
            <select id='language' className='dropdown'></select>
          </div>
        </div>
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
        <div>
          <input
            id='stdin'
            className='inputBox'
            placeholder="Inputs (seperated by an ' | ' symbol)"
          />
          <button className='btn copyBtn' id='compile'>
            Compile
          </button>
        </div>
        <div className='fakeScreen' id='opscreen'>
          <p className='line1'>
            Output<span className='cursor1'>_</span>
          </p>
          <p>{}</p>
        </div>
      </div>
    </div>
  );
};

// const languageList = {
//   C: 'c',
//   'C-99': 'c99',
//   'C++': 'cpp',
//   'C++ 14': 'cpp14',
//   'C++ 17': 'cpp17',
//   PHP: 'php',
//   Perl: 'perl',
//   'Python 2': 'python2',
//   'Python 3': 'python3',
//   Ruby: 'ruby',
//   'GO Lang': 'go',
//   Scala: 'scala',
//   'Bash Shell': 'bash',
//   SQL: 'sql',
//   Pascal: 'pascal',
//   'C#': 'csharp',
//   'VB.Net': 'vbn',
//   Haskell: 'haskell',
//   'Objective C': 'objc',
//   Swift: 'swift',
//   Groovy: 'groovy',
//   Fortran: 'fortran',
//   Lua: 'lua',
//   TCL: 'tcl',
//   Hack: 'hack',
//   RUST: 'rust',
//   D: 'd',
//   Ada: 'ada',
//   Java: 'java',
//   'R Language': 'r',
//   'FREE BASIC': 'freebasic',
//   VERILOG: 'verilog',
//   COBOL: 'cobol',
//   Dart: 'dart',
//   YaBasic: 'yabasic',
//   Clojure: 'clojure',
//   NodeJS: 'nodejs',
//   Scheme: 'scheme',
//   Forth: 'forth',
//   Prolog: 'prolog',
//   Octave: 'octave',
//   CoffeeScript: 'coffeescript',
//   Icon: 'icon',
//   'F#': 'fsharp',
//   'Assembler - NASM': 'nasm',
//   'Assembler - GCC': 'gccasm',
//   Intercal: 'intercal',
//   Nemerle: 'nemerle',
//   Ocaml: 'ocaml',
//   Unlambda: 'unlambda',
//   Picolisp: 'picolisp',
//   SpiderMonkey: 'spidermonkey',
//   'Rhino JS': 'rhino',
//   CLISP: 'clisp',
//   Elixir: 'elixir',
//   Factor: 'factor',
//   Falcon: 'falcon',
//   Fantom: 'fantom',
//   Nim: 'nim',
//   Pike: 'pike',
//   SmallTalk: 'smalltalk',
//   'OZ Mozart': 'mozart',
//   LOLCODE: 'lolcode',
//   Racket: 'racket',
//   Kotlin: 'kotlin',
//   Whitespace: 'whitespace',
//   Erlang: 'erlang',
//   J: 'jlang',
// };

export default EditorPage;
