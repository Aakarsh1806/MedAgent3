import '../styles/globals.css';
import { DoctorProvider } from '../context/DoctorContext';
import { PatientProvider } from '../context/PatientContext';
import { AppProvider } from '../context/AppContext';

export default function App({ Component, pageProps }) {
  return (
    <DoctorProvider>
      <PatientProvider>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </PatientProvider>
    </DoctorProvider>
  );
}
