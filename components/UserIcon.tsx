import { Text, View, Image } from 'react-native';

export default function UserIcon(name:any, image:any){
    return (
        <View style={{
            backgroundColor: '#fff',
            borderRadius: 50,
            width: 100,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Image source={{ uri: image }} style={{
                width: 40,
                height: 40,
                borderRadius: 40,
            }} />
            <Text style={{
                marginTop: 5,
                fontSize: 12,
                color: '#666',
            }}>{name}</Text>
        </View>
    );
}