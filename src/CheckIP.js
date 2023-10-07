import React from 'react';
import $ from 'jquery';
import uuid from 'react-uuid'

export default class checkIP extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const d = new Date()
    const value = await $.getJSON('https://jsonip.com/');
    const location = await $.getJSON(('https://ipapi.co/'+ value.ip + '/json'));
    const data = {
      id:uuid(),
      ip: value.ip,
      time: d,
      zipCode: location.zip,
      lat: location.latitude,
      long: location.longitude,
    }
    await $.ajax({url: 'https://wvbfaxk2n2.execute-api.us-east-1.amazonaws.com/Test?id=hi&ip=test&time=sdf&lat=o&long=o',type: 'PUT',data: JSON.stringify(data)});
  }

  render(){
     return null;
   }
}
