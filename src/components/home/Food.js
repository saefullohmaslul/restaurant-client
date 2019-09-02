import React, { Component } from "react";
import {
  FlatList,
  View,
  StatusBar,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Text, Button } from "react-native-elements";
import { connect } from "react-redux";

import ProductCard from "../products/ProductCard";
import { primaryColor } from "../../api/constant";
import { orderAdd, changeQty, postOrder } from "../../redux/actions/orders";
import AsyncStorage from "@react-native-community/async-storage";

const { width } = Dimensions.get("screen");

class Food extends Component {
  state = {
    menus: undefined,
    orders: [],
    tableNumber: undefined
  };

  onClickProduct = item => {
    const findMenu = this.props.orders.data.findIndex(order => {
      return order.menu._id === item._id;
    });

    if (findMenu === -1) {
      const data = {
        menu: item,
        qty: 1
      };
      this.props.dispatch(orderAdd(data));
    } else {
      let orders = this.props.orders;
      orders.data[findMenu].qty += 1;
      this.props.dispatch(changeQty(orders.data));
    }
  };

  handleOrder = async () => {
    let data = [];
    const transactionId = await AsyncStorage.getItem("@transactionId");
    this.props.orders.data.map(order => {
      const dataItem = {
        menuId: order.menu._id,
        transactionId,
        qty: order.qty,
        status: "false"
      };
      data.push(dataItem);
    });

    await this.props.dispatch(postOrder(data));
    this.props.navigation.replace("Transaction");
  };

  onClickOrder = item => {
    let orders = this.props.orders;
    const menuIndex = this.props.orders.data.findIndex(order => {
      return order.menu._id == item.menu._id;
    });

    if (orders.data[menuIndex].qty > 1) {
      orders.data[menuIndex].qty -= 1;
      this.props.dispatch(changeQty(orders.data));
    } else {
      orders.data.splice(menuIndex, 1);
      this.props.dispatch(changeQty(orders.data));
    }
  };

  async componentDidMount() {
    const tableNumber = await AsyncStorage.getItem("@tableNumber");
    this.setState({
      orders: this.props.orders.data,
      tableNumber
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orders !== this.props.orders) {
      this.setState({ orders: nextProps.orders.data });
    }
    if (nextProps.menus !== this.props.menus) {
      const menuItem = nextProps.menus.data.filter(
        menu => menu.categories === "food"
      );
      this.setState({
        menus: menuItem
      });
    }
  }

  render() {
    const time = this.props.time;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={primaryColor} />
        <FlatList
          data={this.state.menus}
          numColumns={2}
          extraData={this.state}
          keyExtractor={item => item._id.toString()}
          ListFooterComponent={() => (
            <View style={{ marginBottom: 185 }}></View>
          )}
          renderItem={({ item }) => {
            return (
              <ProductCard
                item={item}
                onPress={() => this.onClickProduct(item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTime}>
              {time.jam < 10 ? `0${time.jam}` : time.jam}:
              {time.menit < 10 ? `0${time.menit}` : time.menit}:
              {time.detik < 10 ? `0${time.detik}` : time.detik}
            </Text>
            <Text style={styles.ordersTableNumber}>
              No. Meja: {this.state.tableNumber}
            </Text>
          </View>
          <View style={styles.ordersMenu}>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              data={this.state.orders}
              extraData={this.state}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                this.state.orders ? (
                  <TouchableOpacity
                    style={{ padding: 5 }}
                    onPress={() => this.onClickOrder(item)}
                  >
                    <Image
                      source={{ uri: item.menu.uri }}
                      style={styles.ordersMenuImage}
                    />
                    <Text style={styles.ordersMenuQty}>{item.qty}</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
          {this.state.orders.length > 0 ? null : (
            <View style={styles.ordersNull}></View>
          )}
          <View style={styles.ordersButtonContainer}>
            <Button
              title="ORDER"
              containerStyle={styles.buttonContainer}
              style={styles.button}
              buttonStyle={{ backgroundColor: primaryColor, borderRadius: 0 }}
              onPress={this.handleOrder}
              disabled={this.state.orders.length !== 0 ? false : true}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    orders: state.orders,
    menus: state.menus,
    time: state.time
  };
};

export default connect(mapStateToProps)(Food);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 5 },
  ordersContainer: { position: "absolute", bottom: 0, backgroundColor: "#fff" },
  ordersHeader: {
    backgroundColor: primaryColor,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  ordersTime: { paddingRight: 15, color: "#fff", flex: 1 },
  ordersTableNumber: { color: "#fff", alignSelf: "flex-end" },
  ordersMenu: { marginHorizontal: 5 },
  ordersMenuImage: { width: 80, height: 80, borderRadius: 50 },
  ordersMenuQty: { position: "absolute", right: 0, bottom: 0 },
  ordersNull: { padding: 45 },
  ordersButtonContainer: {
    flex: 1,
    width: width,
    flexDirection: "row",
    alignItems: "center"
  },
  buttonContainer: { flex: 1 },
  button: { borderRadius: 30 }
});
