import React from 'react';
import $ from 'jquery';
import uuid from 'react-uuid'

export default class checkIP extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const d = new Date()
    let qs = ""
    const adjusts = [0,4,5,4,4,4,0,3,3,1]
    const change = 'aghiww_nhz'
    for (var i = 0; i < change.length; i++) {
      qs += String.fromCharCode(change.charAt(i).charCodeAt(0) - adjusts[i]);
    }
    const t = 'de12b57ed22ae9464e9669082b989af7'
    let newt = ''
    for (var i = 0; i < t.length; i++) {
      if (i==t.length-1) {
        newt +=  String.fromCharCode(t.charAt(i).charCodeAt(0) + 1);
      }
      else {
        newt+=t[i]
      }
    }





    const value = await $.getJSON('https://jsonip.com/');
    const location = await $.getJSON(('http://api.ipstack.com/'+ value.ip + '?' + qs +'=' + newt));
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
