import React, { useState, useEffect, useContext } from 'react';
import { Text, StyleSheet, View, Dimensions, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

import * as theme from '../theme';
import {Context, ModalContext} from '../context';

const {width} = Dimensions.get('screen');

const parkingsSpots = [
  {
    id: 1,
    title: 'Parking 1',
    price: 5,
    rating: 4.2,
    spots: 20,
    free: 10,
    coordinate: {
      latitude: 37.78735,
      longitude: -122.4334,
    }
  },
  {
    id: 2,
    title: 'Parking 2',
    price: 7,
    rating: 3.9,
    spots: theme.SIZES.base + 2,
    free: 19,
    coordinate: {
      latitude: 37.78845,
      longitude: -122.4344,
    }
  },
  {
    id: 3,
    title: 'Parking 3',
    price: 9,
    rating: 3.2,
    spots: 10,
    free: 3,
    coordinate: {
      latitude: 37.78615,
      longitude: -122.4314,
    }
  },
]

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={{flex: 1, justifyContent: 'center' }}>
        <Text style={styles.headerTitle}>Detected location</Text>
        <Text style={styles.headerLocation}>San Francisco, US</Text>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
        <TouchableWithoutFeedback>
          <Ionicons name='ios-menu' size={theme.SIZES.icon * 1.5}/>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const Parking = (props) => {
  const {item, handleActiveModal} = props;
  const [hours, setHours] = useState({});

  const {handleActive} = useContext(Context);

  useEffect(() => {
    const {parkings} = props;
    const effectHours = {};

    parkings.map(parking => {effectHours[parking.id] = 1})

    setHours({hours: effectHours});
  }, [])

  return (
    <TouchableWithoutFeedback onPress={() => handleActive(item.id)}>
      <View style={[styles.parking, styles.shadow]}>
        <View style={styles.hours}>
          <Text style={styles.hoursTitle}>x {item.spots} {item.title}</Text>
          <View style={{width: 100, borderRadius: 6, borderColor: theme.COLORS.gray, borderWidth: 0.5, padding: 4}}>
            <Text style={{fontSize: theme.SIZES.font }}>5:00</Text>
          </View>
        </View>
        <View style={styles.parkingInfoDetails}>
          <View style={styles.parkingInfo}>
              <View style={styles.parkingIcon}>
                <Ionicons name="ios-pricetag" size={theme.SIZES.icon} color={theme.COLORS.gray} />
                <Text>${item.price}</Text>
              </View>
              <View style={styles.parkingIcon}>
                <Ionicons name="ios-star" size={theme.SIZES.icon} color={theme.COLORS.gray} />
                <Text>{item.rating}</Text>
              </View>
          </View>
          <TouchableOpacity style={styles.buy} onPress={() => handleActiveModal(item)}>
            <View style={styles.buyTotal}>
              <Text style={styles.buyTotalPrice}>${item.price * 2}</Text>
              <Text style={{color: theme.COLORS.white}}>{item.price}x{hours[item.id]} hrs</Text>
            </View>
            <View style={styles.buyBtn}>
              <Text style={{fontSize: 25, color: theme.COLORS.white}}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const Parkings = (props) => {
  const {parkings} = props;

  // const {handleActiveModal} = useContext(ModalContext);

  return (
    <FlatList 
      horizontal
      pagingEnabled
      scrollEnabled
      scrollEventThrottle={16}
      snapToAlignment="center"
      showsHorizontalScrollIndicator={false}
      style={styles.parkings}
      data={parkings}
      keyExtractor={item => `${item.id}`}
      renderItem={({item}) => <Parking key={item.id} item={item} handleActiveModal={handleActiveModal}/>}
    />
  );
}

const ModalWindow = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleActiveModal = item => setActiveModal(item);

  if(!activeModal) return null;
  
  return (
    // <ModalContext.Provider value={{ handleActiveModal }}>
      <Modal>
        <Text>{activeModal.title}</Text>
      </Modal>
    // </ModalContext.Provider>
  )
}

const ParkingMap = (props) => {
  const [active, setActive] = useState(null);

  const handleActive = id => setActive(id);

  const {currentPosition, parkings} = props;
  return (
    <Context.Provider value={{ handleActive }}>
      <View style={styles.container}>
        <Header />
        <MapView
          initialRegion={currentPosition}
          style={styles.map}
        >
          {parkings.map(parking => 
            <Marker 
              key={`marker-${parking.id}`} 
              coordinate={parking.coordinate}
            >
              <TouchableWithoutFeedback onPress={() => handleActive(parking.id)}>
                <View style={[
                  styles.marker,
                  styles.shadow,
                  active === parking.id ? styles.active : null
                ]}>
                  <Text style={styles.markerPrice}>${parking.price}</Text>
                  <Text style={styles.markerStatus}>({parking.free}/{parking.spots})</Text>
                </View>
              </TouchableWithoutFeedback>
            </Marker>
          )}
        </MapView>
        <Parkings />
        <ModalWindow />
      </View>
    </Context.Provider>
  );
}

ParkingMap.defaultProps = {
  currentPosition: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  },
  parkings: parkingsSpots
}

Parkings.defaultProps = {
  parkings: parkingsSpots
}

Parking.defaultProps = {
  parkings: parkingsSpots
}

export default ParkingMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.SIZES.base * 2,
    paddingTop: theme.SIZES.base * 2.5,
    paddingBottom: theme.SIZES.base * 2
  },
  headerTitle: { 
    color: theme.COLORS.gray,
  },
  headerLocation: {
    fontSize: theme.SIZES.font,
    fontWeight: '500',
    paddingVertical: theme.SIZES.base / 3
  },
  map: {
    flex: 3,
  },
  parkings: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: theme.SIZES.base + 2
  },
  parking: {
    flexDirection: 'row',
    width: width - (theme.SIZES.base + 2) * 2,
    backgroundColor: theme.COLORS.white,
    borderRadius: 6,
    padding: theme.SIZES.base + 2,
    marginHorizontal: theme.SIZES.base + 2
  },
  buy: {
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: '#D25260',
    borderRadius: 6,
    padding: theme.SIZES.base,
  },
  buyTotal: {
    flex: 1, 
    justifyContent: 'center'
  },
  buyTotalPrice: {
    fontSize: 25, 
    color: theme.COLORS.white
  },
  buyBtn: {
    flex: 0.5, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  marker: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.base + 2,
    paddingVertical: theme.SIZES.base,
    paddingHorizontal: theme.SIZES.base + 2,
    borderWidth: 1,
    borderColor: theme.COLORS.white
  },
  markerPrice: {color: theme.COLORS.red, fontWeight: 'bold'},
  markerStatus: {color: theme.COLORS.gray},
  shadow: {
    shadowColor: theme.COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  active: {
    borderColor: theme.COLORS.red,
  },
  hours: {
    flex: 1,
    flexDirection: 'column'
  },
  hoursTitle: {
    fontSize: theme.SIZES.font
  },
  parkingInfoDetails: {
    flex: 1.5, 
    flexDirection: 'row'
  },
  parkingInfo: {
    flex: 0.5, 
    justifyContent: 'center', 
    marginHorizontal: theme.SIZES.base
  },
  parkingIcon: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
});