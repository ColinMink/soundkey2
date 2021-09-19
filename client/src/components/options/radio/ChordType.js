import React, { Component } from 'react';
import './styles.css'

import Radio from './index'

  class ChordTypeRadio extends Component {
    constructor(props) {
        super(props);
    }

    static defaultValue = "Triad";


    render() {
        const title = "Chord Type";
        const options = [
            {
                html: <>3</>,
                value: "Triad"
            },
            {
                html: <>7</>,
                value: "Seven"
            },
            {
                html: <>9</>,
                value: "Nine"
            },
            {
                html: <>11</>,
                value: "Eleven"
            },
            {
                html: <>13</>,
                value: "Thirteen"
            },
            {
                html: <>6</>,
                value: "Six"
            }
        ];
        //const selectedValue = "Triads";

        return (
            <Radio name={"Chord Type"} onUpdate={this.props.onUpdate} title={title} options={options} selectedValue={this.props.selectedValue || "Triad"} />
        );
    }
}
  
  export default ChordTypeRadio;