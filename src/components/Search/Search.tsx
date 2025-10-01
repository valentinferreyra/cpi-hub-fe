import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import { searchPosts, searchUsers } from '../../api';
import type { Post } from '../../types/post';
import type { User } from '../../types/user';

interface SearchProps {
  placeholder?: string;
  className?: string;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Buscar en CPIHub...",
  className = "" 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<{
    posts: Post[];
    users: User[];
  }>({ posts: [], users: [] });
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
      setSearchResults({ posts: [], users: [] });
      setShowResults(false);
      return;
    }
  
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [postsResults, usersResults] = await Promise.all([
          searchPosts(value),
          searchUsers(value)
        ]);
        setSearchResults({ posts: postsResults, users: usersResults });
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults({ posts: [], users: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleInputClick = () => {
    if (searchResults.posts.length > 0 || searchResults.users.length > 0) {
      setShowResults(true);
    }
  };

  const handlePostClick = (post: Post) => {
    setShowResults(false);
    setSearchValue('');
    navigate(`/post/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation(); 
    setShowResults(false);
    setSearchValue('');
    navigate(`/users/${userId}`);
  };

  const handleUserClick = (user: User) => {
    setShowResults(false);
    setSearchValue('');
    navigate(`/users/${user.id}`);
  };

  const handleInputFocus = () => {
    if (searchResults.posts.length > 0 || searchResults.users.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
          ) : (searchResults.posts.length > 0 || searchResults.users.length > 0) ? (
            <>
              <div className="search-results-header">
                <span>
                  {searchResults.posts.length + searchResults.users.length} resultado{(searchResults.posts.length + searchResults.users.length) !== 1 ? 's' : ''} encontrado{(searchResults.posts.length + searchResults.users.length) !== 1 ? 's' : ''}
                </span>
              </div>
              
              {searchResults.users.length > 0 && (
                <>
                  <div className="search-section-header">
                    <span>Usuarios ({searchResults.users.length})</span>
                  </div>
                  {searchResults.users.map((user) => (
                    <div
                      key={user.id}
                      className="search-result-item search-user-item"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="search-result-content">
                        <div className="search-user-info">
                          <div className="search-user-avatar">
                            {user.image ? (
                              <img src={user.image} alt={`${user.name} ${user.last_name}`} />
                            ) : (
                              <div className="search-user-avatar-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="search-user-details">
                            <h4 className="search-result-title">
                              {user.name} {user.last_name}
                            </h4>
                            <p className="search-user-email">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {searchResults.posts.length > 0 && (
                <>
                  <div className="search-section-header">
                    <span>Posts ({searchResults.posts.length})</span>
                  </div>
                  {searchResults.posts.map((post) => (
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
                          <span 
                            className="search-result-author clickable"
                            onClick={(e) => handleAuthorClick(e, parseInt(post.created_by.id))}
                          >
                            por {post.created_by.name} {post.created_by.last_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
