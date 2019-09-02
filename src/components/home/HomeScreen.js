import React, { Component } from "react";
import { FlatList, View, StatusBar, Dimensions } from "react-native";
import { Text, Button } from "react-native-elements";
import { connect } from "react-redux";

import ProductCard from "../products/ProductCard";
import { primaryColor } from "../../api/constant";
import { orderAdd } from "../../redux/actions/orders";
import { menusGet } from "../../redux/actions/menus";
import { timeUpdate } from "../../redux/actions/time";

const { width } = Dimensions.get("screen");

class Home extends Component {
  state = {
    menus: undefined
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
    }
  };

  async componentDidMount() {
    await this.props.dispatch(menusGet());
    this.setState({
      menus: this.props.menus.data
    });
    setInterval(() => {
      this.props.dispatch(timeUpdate(1));
    }, 1000);
  }

  render() {
    console.log(this.props.time);
    return (
      <View style={{ paddingHorizontal: 5 }}>
        <StatusBar backgroundColor={primaryColor} />
        <FlatList
          data={this.state.menus}
          numColumns={2}
          extraData={this.state}
          keyExtractor={item => item._id.toString()}
          ListFooterComponent={() => <View style={{ marginBottom: 50 }}></View>}
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
        <View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              paddingVertical: 2.5,
              borderTopWidth: 1,
              flex: 1,
              width: width - 10,
              borderColor: "#ecf0f1",
              backgroundColor: "#ecf0f1",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Text style={{ paddingHorizontal: 20 }}>
              {this.props.time.jam}:{this.props.time.menit}:
              {this.props.time.detik}
            </Text>
            <Button
              title="Order"
              containerStyle={{ flex: 1 }}
              style={{ borderRadius: 30 }}
              buttonStyle={{ backgroundColor: primaryColor }}
              onPress={() => this.props.navigation.replace("Order")}
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

export default connect(mapStateToProps)(Home);
