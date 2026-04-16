import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { NotificationArea } from './components/NotificationArea';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FlightSearchPage } from './pages/FlightSearchPage';
import { HotelBookingPage } from './pages/HotelBookingPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { TravelRequestPage } from './pages/TravelRequestPage';
import { ExpensePage } from './pages/ExpensePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Navbar />
          <NotificationArea />
          <div style={{ marginTop: '70px' }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/flights" element={<FlightSearchPage />} />
                <Route path="/hotels" element={<HotelBookingPage />} />
                <Route path="/itinerary" element={<ItineraryPage />} />
                <Route path="/travel-request" element={<TravelRequestPage />} />
                <Route path="/expenses" element={<ExpensePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
