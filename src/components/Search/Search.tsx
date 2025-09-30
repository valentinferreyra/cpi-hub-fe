import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import { searchPosts } from '../../services/api';
import type { Post } from '../../types/post';

interface SearchProps {
  placeholder?: string;
  className?: string;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Buscar un tópico...",
  className = "" 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
  
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPosts(value);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching posts:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleInputClick = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handlePostClick = (post: Post) => {
    setShowResults(false);
    setSearchValue('');
    navigate(`/post/${post.id}`);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clicks en los resultados
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Cerrar resultados cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-wrapper" ref={searchRef}>
      <input
        type="text"
        placeholder={placeholder}
        className={`search-input ${className}`}
        value={searchValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      
      {showResults && (
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Buscando...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}</span>
              </div>
              {searchResults.map((post) => (
                <div
                  key={post.id}
                  className="search-result-item"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="search-result-content">
                    <h4 className="search-result-title">{post.title}</h4>
                    <p className="search-result-preview">
                      {post.content.length > 100 
                        ? `${post.content.substring(0, 100)}...` 
                        : post.content
                      }
                    </p>
                    <div className="search-result-meta">
                      <span className="search-result-space">#{post.space.name}</span>
                      <span className="search-result-author">
                        por {post.created_by.name} {post.created_by.last_name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : searchValue.length >= 3 ? (
            <div className="search-no-results">
              <span>No se encontraron resultados para "{searchValue}"</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Search;
