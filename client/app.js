import React from 'react';
import ReactDOM from 'react-dom';

class ChatRoomSelector extends React.Component{
  constructor(props){
    super(props);
    this.state={
      rooms: this.props.rooms,
      roomName: this.props.roomName,
      onSwitch: this.props.onSwitch
    }
  }
  render(){
    return(
      <ul className="nav nav-tabs">
        {
          this.state.rooms.map((room)=>{
            if(room === this.props.roomName){
              console.log('this.props.room',this.props.roomName);
              return <li role='presentation' className='active'><a onClick={() =>{
                this.state.onSwitch(room)
              }}>
                {room}
              </a></li>
            }else{
              return <li role='presentation' className=''><a onClick={() =>{
                this.state.onSwitch(room)
              }}>
                {room}
              </a></li>
            }
          })
        }
      </ul>
    )
  }

}

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      message: '',
      roomMessage: {"Room 1":[]
                  ,"Room 2": []
                  ,"Room 3": []
                  ,"Party Place":[]}
      ,
      messages: [],
      newMessage: '',
      currentTyper: null,
      typing: `${this.props.username} is typing...`
    }
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.updateChange = this.updateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount(){
    this.props.socket.on('message', (message)=>{
      this.setState({
        messages: [...this.state.messages, `${message.username}: ${message.content}`]
      });
    })
    this.setState({
      message: `${this.props.username}: ${this.state.newMessage}`,
      messages: [...this.state.messages, this.state.message]
    })
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.roomName !== this.props.roomName){
      this.state.roomMessage[this.props.roomName] = this.state.messages;
      this.setState({
        messages: this.state.roomMessage[nextProps.roomName]
      })
    }
  }

  updateChange(e){
    this.setState({
      newMessage: e.target.value,
      message: `${this.props.username}: ${e.target.value}`,
      currentTyper: this.props.username
    });

  }
  handleSubmit(e){
    e.preventDefault();
    this.setState({
      newMessage: '',
      message: `${this.props.username}: ${this.state.newMessage}`,
      messages: [...this.state.messages, this.state.message]
    })
    this.props.socket.emit('message', this.state.newMessage);
  }
  render(){
    return(
      <div>
        <div className='messages'>
          {
            this.state.messages.map((message)=>(<p className='message'>{message}</p>))
          }
        </div>
        <span>{this.state.typing = (this.state.currentTyper === null) ? '': this.state.typing}</span>
        <form onSubmit={(e)=>this.handleSubmit(e)}>
          <input type='text' onChange={(e) => this.updateChange(e)} value={this.state.newMessage}/>
          <input type='submit' value="Send"/>
        </form>
      </div>
    )
  }
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      rooms: ['Room 1', 'Room 2', 'Room 3', 'Party Place'],
      roomName: "Party Place",
      username: null
    };
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('app connected');
      // YOUR CODE HERE (2)
      this.state.socket.emit('username', this.state.username);
      this.state.socket.emit('room', this.state.roomName);
      console.log('state: ', this.state.roomName);
    });

    this.state.socket.on('errorMessage', message => {
      alert(message);
    });
  }

  join(room) {
    console.log('rooM: ', room);
    this.setState({
      roomName: room
    });
    this.state.socket.emit('room', room);
  }

  render() {
    return (
      <div>
        Welcome {
          this.state.username = (!this.state.username) ? prompt('Type in your username') : this.state.username
        }!
        <h1>React Chat</h1>
        {
          <ChatRoomSelector onSwitch={(r)=>this.join(r)} rooms={this.state.rooms} roomName={this.state.roomName} />
        }
        {
          <ChatRoom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username}/>
        }
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
