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
  state = { characterAvailable: null, attacking: false, playerClaimed: false, playerReady: false, gameActive: false };

  componentWillMount() {
    this.socket.addEventListener('message', this.handleWsMessage);
    this.socket.addEventListener('open', () => {
      this.socket.send(JSON.stringify({
        playerName: this.props.match.params.playerName,
        action: actions.CHECK_PLAYER_AVAILABLE
      }));
    })
  }

  componentWillUnmount() {
    this.socket.removeEventListener('message', this.handleWsMessage);
  }

  handleWsMessage = (msgEvent) => {
    const msg = JSON.parse(msgEvent.data);

    switch(msg.action) {
      case actions.SEND_PLAYER_AVAILABILITY:
        this.setState({
          characterAvailable: !!msg.characterAvailable
        });
        break;
      case actions.PLAYER_CLAIMED:
        this.setState({
          playerClaimed: true
        });
        break;
      case actions.START_GAME:
        this.setState({
          gameActive: true
        });
        break;
      default:
        // Nada
    }
    // Set player ready notifca
  }

  handleStartPressed = () => {
    if (this.state.playerClaimed) {
      this.socket.send(JSON.stringify({
        playerName: this.props.match.params.playerName,
        action: actions.PLAYER_READY
      }));
    } else {
      this.socket.send(JSON.stringify({
        playerName: this.props.match.params.playerName,
        action: actions.CLAIM_PLAYER
      }));
    }

  }

  renderStartButton() {
    const { playerName } = this.props.match.params;
    let label = `Claim ${playerName.substring(0, 1).toUpperCase()}${playerName.substring(1)} `;

    if (this.state.playerClaimed) {
      label = 'Ready Up';
    }

    return (
      <button type="button" onClick={this.handleStartPressed} className="nes-btn">{label}</button>
    )
  }

  handleAttack = () => {
    if (this.state.attacking) return;

      this.setState({
        attacking: true
      }, () => {
        this.socket.send(JSON.stringify({
          playerName: this.props.match.params.playerName,
          action: actions.ATTACK
        }))
        
        setTimeout(() => {
          this.setState({
            attacking: false
          }, () => {
            this.socket.send(JSON.stringify({
              playerName: this.props.match.params.playerName,
              action: actions.STOP
            }))
          })
        }, 300)
      })
  }

  handleControllerAction = action => {
    this.socket.send(JSON.stringify({
      playerName: this.props.match.params.playerName,
      action
    }))
  }

  renderControllerContent = () => {
    if (this.state.characterAvailable === null) {
      return <h1 className="nes-text is-primary fat-message">Checking if character is available....</h1>;
    } else if (this.state.characterAvailable === false) {
      return (
        <h1 className="nes-text is-error fat-message">
          {this.props.match.params.playerName.toUpperCase()} is in play. Pick a different character or try again later.
        </h1>
      );
    }

    return (
      <div className="gamepad-controller flex-column flex-center">
        {!this.state.gameActive && (
          <div className="ready-container flex-center">
            {this.renderStartButton()}
          </div>
        )}
        <div className="controls">
          <div className="d-pad-controller">
            <button
              onTouchStart={() => this.handleControllerAction(actions.MOVE_LEFT)}
              onTouchEnd={() => this.handleControllerAction(actions.STOP)}
            >
              <FontAwesomeIcon icon={faArrowAltCircleLeft} size="7x" color="#adafbc" />
            </button>
            <button
              onTouchStart={() => this.handleControllerAction(actions.MOVE_RIGHT)}
              onTouchEnd={() => this.handleControllerAction(actions.STOP)}
            >
              <FontAwesomeIcon icon={faArrowAltCircleRight} size="7x" color="#adafbc" />
            </button>
          </div>
          <div className="action-controller">
            <button onTouchStart={this.handleAttack}>
              <FontAwesomeIcon icon={faFistRaised} size="4x" color="white" />
            </button>
          </div>
        </div>
      </div>
    );
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
          {this.renderControllerContent()}
        </MediaQuery>
      </div>
    )
  }
}