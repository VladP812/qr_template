import {useRef, useEffect} from "react"
import { View } from "react-native";
import Quagga from "@ericblade/quagga2";

export const BarcodeScanner = ({callbackBarcodeDetected}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (!document.getElementById("hide-overlay-style")) {
            const style = document.createElement("style");
            style.id = "hide-overlay-style";
            style.innerHTML = ".drawingBuffer { position: absolute; z-index: 9999;}";
            document.head.appendChild(style);
        }

        Quagga.init(
            {
                locate: true,
                inputStream: {
                    type: 'LiveStream',
                    target: videoRef.current, 
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['ean_reader']
                },
                frequency: 10
            },
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                Quagga.start();
            }
        );


        Quagga.onDetected((data) => {
            callbackBarcodeDetected(data.codeResult.code);
        });

        return () => {
            Quagga.offDetected();
            Quagga.stop();
        };
    }, [callbackBarcodeDetected]);

    return <View ref={videoRef} style={{ position: "relative", width: '33%', height: 'auto',
                                        overflow: "hidden", borderRadius: "20px"}} />;
};
