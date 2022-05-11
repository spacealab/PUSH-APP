import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';


Notifications.setNotificationHandler({
    handleNotifications: () =>{
        return {
            shouldShowAlert: true,
        };
    }
})

export default function App() {
    const [pushToken, setPushToken] = useState();

    useEffect(() => {
        Permissions.getAsync(Permissions.NOTIFICATIONS).then(statusObj => {
            if (statusObj.status !== 'granted') {
                return Permissions.askAsync(Permissions.NOTIFICATIONS)
            }
            return statusObj;
        })
        .then((statusObj) => {
            console.log(statusObj);
            if (statusObj.status !== 'granted') {
                throw new Error('Permissions not granted');
            }
        })
        .then(() => {
            Notifications.getExpoPushTokenAsync();
        })
        .then(response => {
            const token = response.data;
            setPushToken(token);
            fetch('https://your-own-api.com/')
        })
        .catch((err) => {
            console.log(err);
            return null;
        })
    }, []);

    useEffect(() => {
        const backgroundSubscription = Notifications.addNotificationReceivedListener(Response => {
            console.log(Response);
        });

        const foregroundSubscription = Notifications.addNotificationReceivedListener(
            (notifications) => {
                console.log(notifications);
            }
        );

        return () => {
            backgroundSubscription.remove();
            foregroundSubscription.remove();
        };
    }, []);

    const triggerNotificationHandler = () => {
        // Notifications.scheduleNotificationAsync({
        //     content: {
        //         title: 'My First local notification',
        //         body: 'This is the First local notification we are sending',
        //         data: { mySpecialData: 'Some text' }
        //     },
        //     trigger: {
        //         seconds: 10,
        //     },
        // });
        fetch('https://expo.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip. deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: pushToken,
                data: {extraData: 'some data'},
                title: 'sent via the app',
                body: 'This push notification was sent via the app',
            })
        });
    };

    return (
        <View style = { styles.container }>
            <Button title='Trigger Notification' onPress={triggerNotificationHandler} /> 
            <StatusBar style = "auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});