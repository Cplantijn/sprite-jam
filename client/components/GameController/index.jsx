import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect } from 'react-router-dom';
import { faFistRaised, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { isMobile } from 'react-device-detect';
import config from '~config';
import MediaQuery from 'react-responsive';
import actions from '~constants/actions';

import './GameController.scss';

export default class GameController extends React.PureComponent {
  socket = new WebSocket(config.WS_ADDRESS);

  componentWillMount() {
    this.socket.addEventListener('message', this.handleWsMessage);
  }

  componentWillUnmount() {
    this.socket.removeEventListener('message', this.handleWsMessage);
  }

  handleWsMessage = (msg) => {
    // Set player ready notifca
  }

  handleStartPressed = () => {
    this.socket.send(JSON.stringify({
      playerName: this.props.match.params.playerName,
      action: actions.PLAYER_READY
    }));
  }

  renderStartButton() {
    const { playerName } = this.props.match.params;
    const label = `Start as ${playerName.substring(0, 1).toUpperCase()}${playerName.substring(1)} `;

    return (
      <button type="button" onClick={this.handleStartPressed} className="nes-btn">{label}</button>
    )
  }

  render() {
    if (!['ryu', 'john', 'blanka', 'ken'].includes(this.props.match.params.playerName.toLowerCase())) {
      return <Redirect to="/" />
    }

    if (!isMobile) {
      return (
        <div className="dark-bg wrapper flex-center flex-middle flex-column">
          <i className="nes-smartphone smartphone-icon" />
          <h1 className="nes-text is-error fat-message">MOBILE SCREENS ONLY!</h1>
        </div>
      )
    }

    return (
      <div className="dark-bg wrapper flex-center flex-middle">
        <MediaQuery orientation="portrait">
          <h1 className="nes-text is-error fat-message">Turn your phone to landscape</h1>
        </MediaQuery>
        <MediaQuery orientation="landscape">
          <div className="gamepad-controller flex-column">
            <div className="ready-container flex-center">
              {this.renderStartButton()}
            </div>
            <div className="controls">
              <div className="d-pad-controller">
                <button>
                  <FontAwesomeIcon icon={faArrowAltCircleLeft} size="7x" color="#adafbc" />
                </button>
                <button>
                  <FontAwesomeIcon icon={faArrowAltCircleRight} size="7x" color="#adafbc" />
                </button>
              </div>
              <div className="action-controller">
                <button>
                  <FontAwesomeIcon icon={faFistRaised} size="4x" color="white" />
                </button>
              </div>
            </div>
          </div>
        </MediaQuery>
      </div>
    )
  }
}