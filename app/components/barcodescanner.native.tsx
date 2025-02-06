import { useRef, useEffect, useCallback } from "react"
import { View, Text } from "react-native"
import { Camera, useCodeScanner, useCameraDevice, useCameraPermission, Code } from "react-native-vision-camera"


export const BarcodeScanner = ({callbackBarcodeDetected}) => {
    const device = useCameraDevice("back")
    const { hasPermission, requestPermission } = useCameraPermission()

    const scanner = useCodeScanner({
        codeTypes: ["ean-13"],
        onCodeScanned: (codes) => {
            callbackBarcodeDetected(codes[0].value)
        }
    })

    if (!device) return <View><Text>No Cameras Available</Text></View>

    if (!hasPermission) {
        requestPermission()
        return <View><Text>Requesting Camera Permissions...</Text></View>
    }



    return (
        <View style={{width: "80%", height: 300, alignSelf: "center", position: "relative",
                      overflow: "hidden", borderRadius: 20}}>
            <Camera
                style={{ flex: 1, width: "100%", height: "100%" }}
                device={device}
                isActive={true}
                codeScanner={scanner}
            />
        </View>
    )
}
