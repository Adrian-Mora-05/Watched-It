const React = require('react');
const { Text, Pressable, View } = require('react-native');

const MockText = (props) => React.createElement(Text, props);
const MockPressable = (props) => React.createElement(Pressable, props);

module.exports = {
  Text: MockText,
  Pressable: MockPressable,
  View,
  Form: View,
  TextInput: require('react-native').TextInput,
};