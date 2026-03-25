import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounce helper
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/product/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data && response.data.success) {
        setResults(response.data.data);
        setIsOpen(true);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search API error:', err);
      setError('Failed to fetch suggestions.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce((q) => fetchSuggestions(q), 300), []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setFocusedIndex(-1);
    
    if (val.trim() === '') {
      setIsOpen(false);
      setResults([]);
    } else {
      setIsOpen(true);
      debouncedFetch(val);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && results[focusedIndex]) {
         handleSelect(results[focusedIndex]);
      } else if (query.trim() !== '') {
         // Optionally navigate to a full search page, for now just close
         setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (product) => {
    setIsOpen(false);
    setQuery('');
    setFocusedIndex(-1);
    navigate(`/product/${product._id}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="position-relative w-100" ref={dropdownRef}>
      
      <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) setIsOpen(false); }} className="d-flex w-100 search-form">
        <div className="input-group">
          <input
            type="text"
            className="form-control rounded-pill-start shadow-none border-secondary text-dark"
            style={{ paddingLeft: '1.25rem', borderRight: 'none' }}
            placeholder="Search products..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (query.trim()) setIsOpen(true); }}
            autoComplete="off"
            aria-label="Search"
          />
          <button
            className="btn btn-outline-secondary rounded-pill-end border-secondary bg-white text-dark"
            type="submit"
            style={{ paddingRight: '1.25rem', borderLeft: 'none' }}
            aria-label="Search Submit"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-search text-primary fw-bold"></i>
            )}
          </button>
        </div>
      </form>

      {/* Embedded Styles for UX Highlights & Border adjustments */}
      <style>{`
        .rounded-pill-start { border-radius: 50rem 0 0 50rem !important; }
        .rounded-pill-end { border-radius: 0 50rem 50rem 0 !important; }
        .search-form input:focus { border-color: #6c757d; box-shadow: none; }
        
        .search-dropdown {
          position: absolute;
          top: 110%;
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
          z-index: 1050;
          max-height: 400px;
          overflow-y: auto;
        }

        .search-item {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          cursor: pointer;
          border-bottom: 1px solid #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .search-item:last-child {
          border-bottom: none;
        }

        .search-item:hover, .search-item.focused {
          background-color: #f8f9fa;
        }
        
        .search-item-img {
          width: 45px;
          height: 45px;
          border-radius: 6px;
          object-fit: cover;
          margin-right: 15px;
          border: 1px solid #eee;
        }
      `}</style>

      {/* Suggestion Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="search-dropdown animate slideIn pb-1 pt-1">
          
          {loading && results.length === 0 && (
            <div className="text-center py-4 text-muted small fw-bold">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Searching database...
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-3 text-danger small bg-light">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-4 text-muted small">
               <i className="bi bi-search me-2"></i>No products found matching "<strong>{query}</strong>"
            </div>
          )}

          {!loading && !error && results.length > 0 && results.map((product, index) => {
            const displayImage = product?.images?.[0] ? product.images[0] : 'https://via.placeholder.com/45?text=No+Img';
            const isActive = index === focusedIndex;

            return (
              <div 
                key={product._id} 
                className={`search-item ${isActive ? 'focused' : ''}`}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <img src={displayImage} alt={product.name} className="search-item-img bg-light" onError={(e) => { e.target.src = 'https://via.placeholder.com/45?text=No+Img'; }} />
                <div className="flex-grow-1 overflow-hidden">
                   <div className="text-dark fw-bold small text-truncate" style={{ fontSize: '0.9rem' }}>
                      {/* Highlight query string natively using simple replace */}
                      {product.name}
                   </div>
                   <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <span className="badge bg-light text-dark border me-2">{product?.category?.name || 'Item'}</span>
                      <span className="text-success fw-bold">₹{product.price}</span>
                   </div>
                </div>
              </div>
            );
          })}
          
        </div>
      )}
    </div>
  );
};

export default Search;
