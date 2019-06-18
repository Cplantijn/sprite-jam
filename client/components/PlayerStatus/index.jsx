import React from 'react';
import { Image as KonvaImage } from 'react-konva';
import loadImages from '~helpers/loadImages';

export default class PlayerStatus extends React.PureComponent {
  state = { imagesLoaded: false };

  async componentDidMount() {
    await loadImages([
      `assets/images/portrait_${this.props.name}.png`,
      `assets/images/portrait_${this.props.name}_disabled.png`,
    ]);

    this.setState({ imagesLoaded: true });
  }

  render() {
    if (!this.state.imagesLoaded) return null;
    
    const img = new Image();
    img.src = `assets/images/portrait_${this.props.name}.png`;

    return (
      <KonvaImage
        x={this.props.x + 102}
        y={this.props.y + 10}
        image={img}
        width={96}
        height={96}
      />
    )
  }
}