import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import { searchPosts, searchUsers, searchSpaces } from '../../api';
import type { Post, SimpleSpace } from '../../types/post';
import type { User } from '../../types/user';
import type { Space } from '../../types/space';

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
    spaces: Space[];
  }>({ posts: [], users: [], spaces: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const hasAnyResults =
    searchResults.posts.length > 0 ||
    searchResults.users.length > 0 ||
    searchResults.spaces.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setSearchResults({ posts: [], users: [], spaces: [] });
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [postsResults, usersResults, spacesResults] = await Promise.all([
          searchPosts(value),
          searchUsers(value),
          searchSpaces(value)
        ]);
        setSearchResults({ posts: postsResults, users: usersResults, spaces: spacesResults });
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults({ posts: [], users: [], spaces: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleInputClick = () => {
    if (hasAnyResults) {
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

  const handleSpaceClick = (space: Space) => {
    setShowResults(false);
    setSearchValue('');
    navigate(`/space/${space.id}`);
  }

  const handleSimpleSpaceClick = (space: SimpleSpace) => {
    setShowResults(false);
    setSearchValue('');
    navigate(`/space/${space.id}`);
  }

  const handleInputFocus = () => {
    if (hasAnyResults) {
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
          ) : hasAnyResults ? (
            <>
              <div className="search-results-header">
                <span>
                  {searchResults.posts.length + searchResults.users.length + searchResults.spaces.length} resultado{(searchResults.posts.length + searchResults.users.length + searchResults.spaces.length) !== 1 ? 's' : ''} encontrado{(searchResults.posts.length + searchResults.users.length + searchResults.spaces.length) !== 1 ? 's' : ''}
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

              {searchResults.spaces.length > 0 && (
                <>
                  <div className="search-section-header">
                    <span>Spaces ({searchResults.spaces.length})</span>
                  </div>
                  {searchResults.spaces.map((space) => (
                    <div
                      key={space.id}
                      className="search-result-item"
                      onClick={() => handleSpaceClick(space)}
                    >
                      <div className="search-result-content">
                        <h4 className="search-result-title">{space.name}</h4>
                        <p className="search-result-preview">
                          {space.description.length > 100
                            ? `${space.description.substring(0, 100)}...`
                            : space.description
                          }
                        </p>
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
                          <span className="search-result-space clickable"
                            onClick={(e) => { e.stopPropagation(); handleSimpleSpaceClick(post.space); }}
                          >#{post.space.name}</span>
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
