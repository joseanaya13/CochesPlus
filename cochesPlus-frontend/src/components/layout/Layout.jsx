import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, hideNavbar = false, hideFooter = false }) => {
    return (
        <div className="flex flex-col min-h-screen ">
            {!hideNavbar && <Navbar />}
            <main className="flex-grow">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    hideFooter: PropTypes.bool
};

export default Layout;
