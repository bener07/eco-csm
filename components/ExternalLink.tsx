import React from 'react';
import { Text, Linking, TouchableOpacity } from 'react-native';

export default function ExternalLink({ url, children, style }) {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <TouchableOpacity 
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.6}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{justifyContent: 'center', alignItems: 'center'}}
    >
      <Text style={[
        { 
          color: 'blue', 
          textDecorationLine: 'underline',
          opacity: isPressed ? 0.6 : 1,
          lineHeight: 30,
        },
        style
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}