import React, { useState, useEffect, useCallback } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Slider from "./Slider";
import {
  FormControl,
  InputLabel,
  Select,
  ButtonGroup,
  CardContent,
  Card,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SpeedIcon from "@mui/icons-material/Speed";
import EvStationIcon from "@mui/icons-material/EvStation";
import SettingsIcon from "@mui/icons-material/Settings";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

const FilterForm = ({
  filters,
  setFilters,
  handleNextPage,
  handlePrevPage,
  page,
  setPage,
  hasMoreListings,
}) => {
  const debouncedHandleFilterChange = debounce((name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });

    if (name === "model") {
      setSelectedModels(value);
    }
  }, 300);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (value === "") {
      debouncedHandleFilterChange(name, value);
      setPage(1);
    } else {
      if (name === "yearFrom" || name === "yearTo") {
        if (name === "yearFrom") {
          setYearFromText(value);
        } else {
          setYearToText(value);
        }
        const newValue = [
          parseInt(yearFromText) || minYear,
          parseInt(yearToText) || maxYear,
        ];
        handleSliderChange("yearFrom", "yearTo", setYearSliderValue, newValue);
      } else if (name === "mileageFrom" || name === "mileageTo") {
        if (name === "mileageFrom") {
          setMileageFromText(value);
        } else {
          setMileageToText(value);
        }
        const newValue = [
          parseInt(mileageFromText) || minMileage,
          parseInt(mileageToText) || maxMileage,
        ];
        handleSliderChange(
          "mileageFrom",
          "mileageTo",
          setMileageSliderValue,
          newValue
        );
      } else if (name === "priceFrom" || name === "priceTo") {
        if (name === "priceFrom") {
          setPriceFromText(value);
        } else {
          setPriceToText(value);
        }
        const newValue = [
          parseInt(priceFromText) || minPrice,
          parseInt(priceToText) || maxPrice,
        ];
        handleSliderChange(
          "priceFrom",
          "priceTo",
          setPriceSliderValue,
          newValue
        );
      } else {
        debouncedHandleFilterChange(name, value);
        setPage(1);
      }
    }
  };

  const debouncedSliderChange = debounce((nameFrom, nameTo, newValue) => {
    setFilters({
      ...filters,
      [nameFrom]: newValue[0],
      [nameTo]: newValue[1],
    });
  }, 800);

  const handleSliderChange = (nameFrom, nameTo, setValue, newValue) => {
    setValue(newValue);
    debouncedSliderChange(nameFrom, nameTo, newValue);
    setPage(1);
  };

  const renderSectionTitle = (title, IconComponent) => (
    <Typography variant="h6" gutterBottom>
      <Box
        component="span"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <IconComponent fontSize="medium" />
        {title}
      </Box>
    </Typography>
  );

  const renderTextField = (label, name) => (
    <TextField
      label={label}
      name={name}
      value={filters[name] || ""}
      onChange={handleFilterChange}
      variant="outlined"
      size="small"
      fullWidth
    />
  );

  const renderSelectField = (label, name, options, multiple = false) => (
    <FormControl fullWidth variant="outlined" size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={filters[name] || []}
        onChange={handleFilterChange}
        multiple={multiple}
      >
        <MenuItem
          value=""
          onClick={() => setFilters((prev) => ({ ...prev, name: [] }))}
        >
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <Box paddingTop={1} />
    </FormControl>
  );

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [yearFromText, setYearFromText] = useState(filters.yearFrom || "");
  const [yearToText, setYearToText] = useState(filters.yearTo || "");
  const [mileageFromText, setMileageFromText] = useState(
    filters.mileageFrom || ""
  );
  const [mileageToText, setMileageToText] = useState(filters.mileageTo || "");
  const [priceFromText, setPriceFromText] = useState(filters.priceFrom || "");
  const [priceToText, setPriceToText] = useState(filters.priceTo || "");

  const minMileage = 0;
  const maxMileage = 300000;
  const minPrice = 1000;
  const maxPrice = 150000;
  const minYear = 1970;
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear;

  const [yearSliderValue, setYearSliderValue] = useState([
    filters.yearFrom || minYear,
    filters.yearTo || currentYear,
  ]);
  const [mileageSliderValue, setMileageSliderValue] = useState([
    filters.mileageFrom || minMileage,
    filters.mileageTo || maxMileage,
  ]);
  const [priceSliderValue, setPriceSliderValue] = useState([
    filters.priceFrom || minPrice,
    filters.priceTo || maxPrice,
  ]);

  useEffect(() => {
    setSelectedModels(filters.model);
  }, [filters.model]);

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await fetch("/api/makes-models-trims/");
        const data = await response.json();
        setMakes(data);
      } catch (error) {
        console.error("Error fetching makes:", error);
      }
    };

    fetchMakes();
  }, []);

  // Fetching models for multiple selected makes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsResponse = await Promise.all(
          filters.make.map(async (make) => {
            const response = await fetch(
              `/api/makes-models-trims/?make=${make}`
            );
            const data = await response.json();
            return data.map((model) => ({ make, name: model }));
          })
        );

        const allModels = modelsResponse.flat();
        setModels(allModels);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    if (filters.make && filters.make.length) {
      fetchModels();
    }
  }, [filters.make]);

  // Fetching trims for multiple selected makes and models
  useEffect(() => {
    const fetchTrims = async () => {
      try {
        const trimsData = await Promise.all(
          selectedModels.map(async (model) => {
            const make = models.find((m) => m.name === model)?.make;
            if (!make) return [];
            const response = await fetch(
              `/api/makes-models-trims/?make=${make}&model=${model}`
            );
            const data = await response.json();
            return data;
          })
        );

        const combinedTrims = trimsData.flat();
        setTrims(combinedTrims);
      } catch (error) {
        console.error("Error fetching trims:", error);
      }
    };

    if (
      filters.make &&
      filters.make.length > 0 &&
      selectedModels &&
      selectedModels.length > 0
    ) {
      fetchTrims();
    } else {
      setTrims([]);
    }
  }, [filters.make, selectedModels, models]);

  useEffect(() => {
    setFilters({
      ...filters,
    });
  }, []);

  const renderYearSlider = () => (
    <Slider
      label="Year Range"
      minLabel="Year From"
      maxLabel="Year To"
      value={yearSliderValue}
      onChange={setYearSliderValue}
      valueLabelDisplay="auto"
      min={minYear}
      max={maxYear}
      sx={{ width: "100%" }}
    />
  );

  const renderMileageSlider = () => (
    <Slider
      label="Mileage Range"
      minLabel="Mileage From"
      maxLabel="Mileage To"
      value={mileageSliderValue}
      onChange={setMileageSliderValue}
      valueLabelDisplay="auto"
      min={minMileage}
      max={maxMileage}
      sx={{ width: "100%" }}
    />
  );

  const renderPriceSlider = () => (
    <Slider
      label="Price Range"
      minLabel="Price From"
      maxLabel="Price To"
      value={priceSliderValue}
      onChange={setPriceSliderValue}
      valueLabelDisplay="auto"
      min={minPrice}
      max={maxPrice}
      sx={{ width: "100%" }}
    />
  );

  const debounceSetFilters = useCallback(
    debounce((filters) => setFilters(filters), 500),
    []
  );

  useEffect(() => {
    debounceSetFilters({
      ...filters,
      yearFrom: yearSliderValue[0],
      yearTo: yearSliderValue[1],
      mileageFrom: mileageSliderValue[0],
      mileageTo: mileageSliderValue[1],
      priceFrom: priceSliderValue[0],
      priceTo: priceSliderValue[1],
    });
  }, [yearSliderValue, mileageSliderValue, priceSliderValue]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ padding: 3 }}>
              {renderSectionTitle("Vehicle", DriveEtaIcon)}
              {renderSelectField("Make", "make", makes, true)}
              {renderSelectField(
                "Model",
                "model",
                models.map((model) => model.name),
                true
              )}
              {renderSelectField("Trim", "trim", trims, true)}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ padding: 3 }}>
              {renderSectionTitle("Year & Price", AttachMoneyIcon)}
              {renderYearSlider()}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 1,
                }}
              ></Box>
              {renderPriceSlider()}
              <Box
                sx={{ display: "flex", justifyContent: "space-between" }}
              ></Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ padding: 3 }}>
              {renderSectionTitle("Mileage & Seller", SpeedIcon)}
              {renderMileageSlider()}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 1,
                }}
              ></Box>
              {renderSelectField("Seller Type", "sellerType", [
                "For Sale By Owner",
                "Dealership",
              ])}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ padding: 3 }}>
              {renderSectionTitle("Vehicle Details", EvStationIcon)}
              {renderSelectField("New or Used", "newUsed", [
                "Used",
                "New",
                "Certified",
              ])}
              {renderSectionTitle("Transmission", SettingsIcon)}
              {renderSelectField("Transmission", "transmission", [
                "Automatic",
                "Manual",
                "CVT",
                "Automanual",
              ])}
              {renderSectionTitle("Fuel Type", LocalGasStationIcon)}
              {renderSelectField("Fuel Type", "fuel", [
                "Compressed Natural Gas",
                "Diesel",
                "Electric",
                "Flex Fuel",
                "Gasoline",
                "Hybrid",
              ])}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ padding: 3 }}>
              {renderSectionTitle("Drive", MergeTypeIcon)}
              {renderSelectField("Drive", "drive", [
                "2-Wheel Drive",
                "4-Wheel Drive",
                "AWD",
                "FWD",
                "RWD",
              ])}
              {renderSectionTitle("Title Type", DriveFileRenameOutlineIcon)}
              {renderSelectField("Title Type", "titleType", [
                "Clean Title",
                "Dismantled Title",
                "Not Specified",
                "Rebuilt/Reconstructed Title",
                "Salvage Title",
              ])}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
          paddingBottom: 2,
        }}
      >
        <ButtonGroup>
          <Button
            onClick={handlePrevPage}
            variant="contained"
            color="primary"
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            variant="contained"
            color="primary"
            disabled={!hasMoreListings}
          >
            Next
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default FilterForm;
