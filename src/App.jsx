import React from "react";
import { Routes, Route } from "react-router-dom";

import Hero from "./components/hero";
import Navbar from "./components/navBar";
import Banner from "./components/banner";
import { Features } from "./components/features";
import Characters from "./components/characters";
import Requirements from "./components/requirements";
import Footer from "./components/footer";
import ShopPage from "../pages/shopPage";
import ForumPage from "../pages/forumPage";
import AdminApp from "../admin/adminApp";
import AdminPanel from "../admin/adminPanel";
import NotFoundPage from "./components/notFoundPage";
function Home() {
  return (
    <>
      <Hero />
      <Banner />
      <Features />
      <Characters />
      <Requirements />
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFoundPage />} /> 
      </Routes>
    </>
  );
}

export default App;