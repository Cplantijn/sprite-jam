import React from 'react';
import NoteCanvas from '~components/NoteCanvas';

export default class Lobby extends React.PureComponent {
  render() {
    return (
      <div className="lobby">
        <NoteCanvas />
      </div>
    );
  }
}