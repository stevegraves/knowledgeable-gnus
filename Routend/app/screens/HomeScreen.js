import React from 'react';
import Exponent from 'exponent';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import { MonoText } from '../components/StyledText';
import { Components } from 'exponent';
import { connect } from 'react-redux';
import DatePicker from 'react-native-datepicker';
import Button from 'apsl-react-native-button';
import Router from '../navigation/Router';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../actions';
var moment = require('moment');

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date:"2017-01-01",
      userId: 1,
      position: '',
      ready: false,
      currentPosition: {
              latitude: 0,
              longitude: 0,
              latitudeDelta: 0,
              longitudeDelta: 0,
            },
    }
  }
  static route = {
    navigationBar: {
      visible: true,
      title: (<Image style={{height: 30, width: 100}} source={{uri: 'http://servicevirtualization.com/wp-content/uploads/2015/09/testing_graphic.jpg'}}></Image>),
      backgroundColor: '#175785'
    },
  }

  componentWillMount() {
    this.state.date = moment().format("YYYY-MM-DD");
    this.state.currentStart = moment(this.state.date + ' 00').unix();
    this.state.currentEnd = moment(this.state.date + ' 24').unix();
    var that = this;
    this._setPosition();
    this.props.fetchCoord(this.state.userId, this.state.currentStart, this.state.currentEnd)
    .done(function() {
      that.currentData = [];
      for (var i = 0; i < that.props.lines.length; i++) {
        that.currentData.push({id: i, coordinates: {latitude: that.props.lines[i].lat, longitude: that.props.lines[i].lng}})
      }
      that.test = that.currentData.map(function(item) {
      return item.coordinates;
      });
      console.log('that.test', that.test)
      that.props.fetchPlaces(that.state.userId).done(function() {
        that.tracked = [];
        for (var i = 0; i < that.props.places.length; i++) {
          that.tracked.push({id: that.props.places[i].id, name: that.props.places[i].name, category: that.props.places[i].category, coordinates: {latitude: that.props.places[i].lat, longitude: that.props.places[i].lng}});
        }
        that.setState({
          ready: true,
        });
        console.log('that.tracked', that.tracked)
      })
    });

  }

  setCurrentPosition(position) {
    this.setState({
            currentPosition: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
        });
  }

  // componentDidMount() {
  //   setInterval(this._setPosition.bind(this), 5000);
  // }

  _setPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
        this.setCurrentPosition(position);
    }, (error) => {
        alert(error)
    }, {timeout: 20000, maximumAge: 1000});
  }

  render() {
    var that = this;
    if (this.state.ready === false) {
      return (
        <Exponent.Components.AppLoading />
        )
    } else {
      return (
        <View style={{flex: 1, backgroundColor: '#f6f6f6'}}>
          <View style={{flex: 10}}>
            <Components.MapView.Animated
                showsUserLocation={true}

                style={{flex: 13, zIndex: 0}}
                initialRegion={this.state.currentPosition}
                // followsUserLocation={true}
                showsCompass={true}
                >

              {this.tracked.map(marker =>
                <Components.MapView.Marker
                  key={marker.id}
                  coordinate={marker.coordinates}
                  title={marker.name}
                  description={'Category: ' + marker.category}
                />
              )}

              <Components.MapView.Polyline
              coordinates={this.test}
              strokeWidth={3}
              strokeColor={'#b2b2ff'}
              />
          </Components.MapView.Animated>
          <View style={{flex: 1.2, position: 'absolute', zIndex: 1, top: (Dimensions.get('window').height * 0.686)}}>
            <View style={{justifyContent: 'center', flexDirection: 'row', backgroundColor: '#fcfcfc', width: (Dimensions.get('window').width * 0.92), height: (Dimensions.get('window').height * 0.10), borderRadius: 2, left: (Dimensions.get('window').width * 0.04), borderWidth: 0.8, borderColor: '#d3d3d3', opacity: 0.97}}>
                <DatePicker
                    style={{height: 2000, width: 118, right: 8, top: (Dimensions.get('window').height * 0.015)}}
                    date={this.state.date}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    minDate="2016-05-01"
                    maxDate={this.state.date}
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 8.3,
                        marginLeft: 0,
                        height: 23,
                      },
                      dateInput: {
                        marginLeft: 32
                      }
                    }}
                    onDateChange={(date) => {
                      var that = this;
                      var startDate = moment(date + ' 00').unix();
                      var endDate = moment(date + '24').unix();
                      this.props.fetchCoord(this.state.userId, startDate, endDate)
                      .done(function() {
                        that.currentData = [];
                        for (var i = 0; i < that.props.lines.length; i++) {
                          that.currentData.push({id: i, coordinates: {latitude: that.props.lines[i].lat, longitude: that.props.lines[i].lng}})
                        }
                        that.test = that.currentData.map(function(item) {
                        return item.coordinates;
                        });
                        console.log('that.test', that.test)
                        that.props.fetchPlaces(that.state.userId).done(function() {
                          that.tracked = [];
                          for (var i = 0; i < that.props.places.length; i++) {
                            that.tracked.push({id: that.props.places[i].id, name: that.props.places[i].name, category: that.props.places[i].category, coordinates: {latitude: that.props.places[i].lat, longitude: that.props.places[i].lng}});
                          }
                          that.setState({
                            ready: true,
                          });
                        });
                      });
                    }}
                />
                <Text style={{top: (Dimensions.get('window').height * 0.026), fontSize: 20, fontWeight: '100',color: '#545454'}}> | </Text>
                <Button onPress={() => { this.props.navigator.push(Router.getRoute('tracklocation')) }} style={{backgroundColor: '#fcfcfc', top: (Dimensions.get('window').height * 0.026), left: 8, height: 25, width: 100, borderRadius: 0, borderWidth: 0}} textStyle={{fontSize: 12}}>
                  Track a Place
                </Button>
              </View>
           </View>
        </View>
      </View>
      );
    }
  }
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
}

function mapStateToProps(state) {
  return {
    polylines: state.today,
    lines: state.testCount,
    places: state.trackedPlaces,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);