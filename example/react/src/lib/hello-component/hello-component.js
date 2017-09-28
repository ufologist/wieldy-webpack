import './hello-component.css';

import React from 'react';

class HelloComponent extends React.Component {
    render() {
        return (
            <div className="hello-component">
                <p className="hello-component__text">Hello, {this.props.name}</p>        
            </div>
        );
    }
}

export default HelloComponent;