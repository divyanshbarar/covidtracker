import { Card, CardContent, FormControl, MenuItem, Select } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./App.css";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Map from "./Map";
import Table from "./Table";
import { prettyPrintStat, sortData } from "./util";
import "leaflet/dist/leaflet.css"


function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("Worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])


  const [mapCenter, setMapCenter] = useState([34.80746, -40.4796]);
  const [zoom, setZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases")


  // https://disease.sh/v3/covid-19/countries
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then((response)=>response.json())
    .then((data)=>{
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {

          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ))
          const sortedData =sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
          
        })

    }
    getCountriesData()
  }, [])

  const onCountryChange = async (Event) => {
    const countryCode = Event.target.value
    //console.log(countryCode)

    setCountry(countryCode)

    //call the country
    const url= countryCode=== 'Worldwide' ? 'https://disease.sh/v3/covid-19/all':
    `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response =>response.json())
    .then(data=>{
      setCountry(countryCode)
      setCountryInfo(data);

      if(countryCode === "Worldwide")
          {setMapCenter([34.80746, -40.4796])
          setZoom(2)}
          else
          {
            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setZoom(4)}
    })
  }
  console.log(countryInfo)

  return (
    <div className="App">
      {/* header */}
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">

            <Select variant="outlined"
              onChange={onCountryChange}
              value={country}>

              <MenuItem value="Worldwide">Worldwide</MenuItem>
              {
                countries.map(
                  country => (
                    <MenuItem value={country.value}>{country.name}

                    </MenuItem>)
                )
              }

              {/* 
            <MenuItem value="worldwide">india</MenuItem>
            <MenuItem value="worldwide">usa</MenuItem> */}
            </Select>
          </FormControl>
        </div>


        {/* infobox */}

        <div className="app__stats">
          <InfoBox 
          isRed
          active={casesType ==="cases"}
          onClick={(e=>setCasesType("cases"))}
          title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />

          <InfoBox
          active={casesType ==="recovered"}
          onClick={(e=>setCasesType("recovered"))}
          title="Recovered Cases" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox 
          isRed
          active={casesType ==="deaths"}
          onClick={(e=>setCasesType("deaths"))}
          title="Death Cases" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />

        </div>

        {/* map */}
        <Map 
        casesType={casesType}
        countries={mapCountries}
        center={mapCenter}
        zoom={zoom}/>

      </div>
      <Card className="app__right">
        <CardContent>
          {/* table */}
          <h3>Live Cases by  Top Countries</h3>
          <Table countries={tableData}/>
        </CardContent>
        <CardContent>
          
        <h3>Worlwide  {casesType}</h3>
        <LineGraph casesType={casesType}/>
        {/* graph */}
        </CardContent>

      </ Card>

    </div>
  );
}

export default App;
