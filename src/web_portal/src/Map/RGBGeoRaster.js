import React, { useEffect, useState } from "react";
import { useLeaflet, Popup } from "react-leaflet";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import chroma from "chroma-js";
import geoblaze from "geoblaze";
import "antd/dist/antd.css";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";
export default function GeoRaster(props) {
  // const { changeRasterLoader } = props;
  const dispatch = useDispatch();
  const { map, layerContainer } = useLeaflet();
  const currentLayer = useSelector((state) => state.CurrentLayer);
  const currentLayerType = useSelector((state) => state.CurrentLayerType);
  const currentRegionType = useSelector((state) => state.CurrentRegion);
  const vectorLoader = useSelector((state) => state.VectorLoader);
  const RasterOpacity = useSelector((state) => state.RasterOpacity);
  const ColorscalePicker = useSelector((state) => state.SetColor);
  const [layermin, setLayermin] = useState(0);
  const [layermax, setLayermax] = useState(0);
  const [layerrange, setLayerrange] = useState(0);
  const [layerscale, setLayerscale] = useState(null);
  const removeLayer = (layer) => {
    map.removeLayer(layer);
    window.tiff = 0;
  };
  const layerRef = React.useRef(null);
  var scale;

  useEffect(() => {
    // side effect here on change of any of props.x or stateY
    setTimeout(function () {
      getColorFromValues();
    }, 700);
  }, [ColorscalePicker, RasterOpacity]);

  function getColorFromValues() {
    if (layerRef.current != null) {
      layerRef.current.updateColors(function (values) {
        // console.log("PIXEL VALUEs",values)
        if (RasterOpacity == false) {
          return null;
        } else {
          if (values < layermin) {
            return null;
          } else if (values > layermax) {
            return "#757575";
          }
          if (currentLayer == "LULC") {
            var newScale = chroma.scale([
              "#dc0f0f",
              "#44ce5d",
              "#7533e6",
              "#de8313",
              "#dfef4d",
              "#98e16e",
              "#bb3cc9",
              "#455dca",
              "#3feabd",
              "#cf3c8d",
              "#64caef",
            ]);
            var scaledPixelvalue = (values - layermin) / layerrange;
            var color = newScale(scaledPixelvalue).hex();
            return color;
          } else {
            var newScale = chroma
              .scale(ColorscalePicker)
              .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
            var scaledPixelvalue = (values - layermin) / layerrange;
            var color = newScale(scaledPixelvalue).hex();
            return color;
          }
        }
      });
    }
  }
  async function addlayer() {
    props.changeLoader(17.754639747121828, 79.05833831966801);
    var url =
      "https://internalapidev.chickenkiller.com/currentraster?parameter=" +
      currentLayer;
    fetch(url).then((response) => {
      const container = layerContainer || map;
      let layer;
      // if (layerRef.current == undefined) {
      //   console.log("NO LAYER");
      // }
      if (layerRef.current != undefined) {
        removeLayer(layerRef.current);
        // layerRef.current = null;
        // window.tiff = 0;
      }
      console.log("INSODE RGBGEORASTER");
      response.blob().then((blob) => {
        try {
          console.log("INSODE RGBGEORASTER 222", blob);
          geoblaze.load(blob).then((georaster) => {
            // const result=geoblaze.identify(georaster,[150.916672,-31.08333])
            // console.log("FIRST VALUE", georaster);
            // var min = georaster.mins[0];
            // var max = georaster.maxs[0];
            var min = georaster.mins[0];
            var max = georaster.maxs[0];
            console.log("MIN MAX", min, max);
            setLayermin(min);
            setLayermax(max);
            // if (currentLayer == "NDVI") {
            //   min = 0;
            //   max = 1;
            //   setLayermin(0);
            //   setLayermax(1);
            // } else if (currentLayer == "RWI") {
            //   min = -1;
            //   max = 1;
            //   setLayermin(-1);
            //   setLayermax(1);
            // } else if (currentLayer == "POPULATION") {
            //   min = 0;
            //   max = 16000;
            //   setLayermin(0);
            //   setLayermax(16000);
            // }
            if (currentLayer == "LULC") {
              var range = georaster.ranges[0];
              setLayerrange(range);
              //  var scale = chroma.scale("Spectral").domain([0, 1]);
              scale = chroma.scale([
                "#dc0f0f",
                "#44ce5d",
                "#7533e6",
                "#de8313",
                "#dfef4d",
                "#98e16e",
                "#bb3cc9",
                "#455dca",
                "#3feabd",
                "#cf3c8d",
                "#64caef",
              ]);
              setLayerscale(scale);
              window.tiff = georaster;
            } else {
              var range = georaster.ranges[0];
              setLayerrange(range);
              // var scale = chroma.scale("Spectral").domain([0, 1]);
              scale = chroma
                .scale(ColorscalePicker)
                .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
              setLayerscale(scale);
            }
            window.tiff = georaster;
            layer = new GeoRasterLayer({
              // attribution: "Planet",
              georaster,
              opacity: 1.0,
              resolution: 128,
              debugLevel: 0,
              // pane: 'something',
              pixelValuesToColorFn: (values) => {
                var pixelValue = values[0];
                // console.log("DATA VALUE",pixelValue)
                if (pixelValue < min) {
                  return null;
                } else if (pixelValue > max) {
                  return "#757575";
                } else {
                  var scaledPixelvalue = (pixelValue - min) / range;
                  var color = scale(scaledPixelvalue).hex();
                  return color;
                }
              },
              // onEachFeature : (feature, layer) => {
              //   layer.on('mouseover', function (e) {
              //     console.log("HOBER")
              //   });
              // }
            });
            map.on("mousemove", function (evt) {
              var latlng = map.mouseEventToLatLng(evt.originalEvent);
              {
                // props.currentloc(latlng.lat, latlng.lng);
              }
              {
                // getcurrentvalue(latlng.lng, latlng.lat);
                if (currentLayerType == "Raster") {
                  let result = geoblaze.identify(georaster, [
                    latlng.lng,
                    latlng.lat,
                  ]);
                  if (Number(result) > 0.0) {
                    result = parseFloat(result).toFixed(2);
                    dispatch({ type: "SETVALUE", payload: result });
                  }
                }
              }
            });
            map.on("click", async function (evt) {
              var latlng = map.mouseEventToLatLng(evt.originalEvent);
              var loc = [latlng.lng, latlng.lat];

              const shapegeojson = {
                type: "Polygon",
                coordinates: [
                  [
                    [78.936767578125, 18.127580917219024],
                    [78.88458251953125, 18.03358642603099],
                    [79.16748046874999, 17.981345545819597],
                    [78.936767578125, 18.127580917219024],
                  ],
                ],
              };
              // const stats = await geoblaze.stats(window.tiff, shapegeojson);
              // const histograms = await geoblaze.histogram(window.tiff, shapegeojson,{ scaleType: "ratio", numClasses: 10, classType: "equal-interval" });
              // console.log("STATS",histograms)
              const result = geoblaze.identify(window.tiff, loc);
              // props.togglechart();
              if (result != null) {
                if (result > 1) {
                  {
                    // props.update(result);
                    // console.log("CLICK VALUE", result);
                  }
                  {
                    // props.setloc(latlng.lat, latlng.lng);
                  }
                }
              }
            });

            layerRef.current = layer;
            container.addLayer(layer);
            dispatch({
              type: "ENABLERASTER",
            });
            props.changeLoader(60.732421875, 80.67555881973475);
          });
        } catch (err) {
          message.error("Failed to connect to server");
        }

        return () => map.removeLayer(layerRef.current);
      });
    });
  }

  useEffect(() => {
    addlayer();
    props.onRef(undefined);
  }, [currentLayer]);

  return null;
}