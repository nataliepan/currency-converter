import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import './App.css';
import useHttpText from './app/hooks/use-http-text';


type Currency = {
  id: number, 
  country: string, 
  currency: string, 
  amount: number, 
  code: string, 
  rate: number
};

let fetchedRates = false;

function App() {

  const [date, setDate] = useState<string>();
  const columns = ["country", "currency", "amount", "code", "rate"];
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(16);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>();
  const [czk, setCzk] = useState<number>();
  const [convertedAmount, setConvertedAmount] = useState<number>();
  
  const {isLoading, error, fetchRequest} = useHttpText();

  const transformCzData = (data: string) => {
    const fetchedCurrencies:Currency[] = [];
    const transformedData = data.split("\n").forEach((line, index) => {
      if(index == 0){
        setDate(line)
      } else if(index > 1){
        const [country, currency, amount, code, rate] = line.split("|");
        if(country && currency && amount && code && rate){
          fetchedCurrencies.push({id: index-2, country, currency, amount: Number(amount), code, rate: Number(rate)});
        }
      }
    });
    setCurrencies(fetchedCurrencies);
  }

  const handleSelectedCurrency = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCurrency(currencies[Number(event.target.value)]);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

 useEffect(() => {
  if(!fetchedRates){
    fetchRequest({
      url: "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt"
    } as Request, transformCzData);
    fetchedRates = true;
  }
 }, []);

 useEffect(() => {
  if(selectedCurrency && czk){
    setConvertedAmount(czk * selectedCurrency.amount * 1.0 / selectedCurrency.rate);
  } else {
    setConvertedAmount(undefined);
  }
 }, [selectedCurrency, czk]);

  return (
    <div className="App">
      <header className="App-header">
        <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        {isLoading && <Alert severity="info">Loading...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="h4" component="h1">
          CZK Converter
          </Typography>
        <Typography variant="h6">
          {date}
        </Typography>
        <TextField 
          id="czk-amount"
          label="CZK Amount"
          type="number"
          value={czk}
          onChange={(e) => {
              if(e.target.value === ""){
                setCzk(undefined);
              }else{
                setCzk(Number(e.target.value))
              }
          }
        }
        ></TextField>
        <TextField
          id="select-currency"
          select
          label="Currency"
          onChange={handleSelectedCurrency}
        >
          {currencies.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.code}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="h5" component="h2" style={{minHeight:100}}>
          {convertedAmount} {convertedAmount !== undefined ? selectedCurrency?.code : ""}
        </Typography>
        <Divider light />
        <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currencies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((currency) => {
                console.log('currency', currency)
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={currency.id}>
                    {columns.map((column) => {
                      const value = currency[column as keyof Currency];
                      console.log('column' + column, ' value: ' + currency[column as keyof Currency])
                      
                      return (
                        <TableCell key={column}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={currencies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Table>
      </TableContainer>
        </div>
        </Box>
      </header>
    </div>
  );
}

export default App;
