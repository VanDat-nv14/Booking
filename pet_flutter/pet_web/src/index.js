import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'animate.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';// hoặc 'antd/dist/antd.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Ngăn chặn lỗi ResizeObserver hiển thị trong console
const resizeObserverError = /^ResizeObserver loop/;
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && resizeObserverError.test(args[0])) {
    // Bỏ qua lỗi ResizeObserver
    return;
  }
  originalConsoleError.apply(console, args);
};

// Tạo theme cho ứng dụng
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Bạn có thể thay đổi màu chính ở đây
      light: '#4791db',
      dark: '#115293',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [...createTheme().shadows],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="261005055168-52qfvdmp7n3fo022tffqco0o4ilvp7hb.apps.googleusercontent.com">
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);