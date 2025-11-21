import { useState, useEffect } from "react";
import type { News } from "../../types/news";
import { getNews } from "../../api";
import "./NewsCarousel.css";

function NewsCarousel() {
  const [news, setNews] = useState<News[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? news.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
  };

  const isValidUrl = (url?: string) => !!url && /^https?:\/\//.test(url.trim());

  const handleContentClick = (newsItem: News) => {
    if (!isValidUrl(newsItem.RedirectURL)) return;
    window.open(newsItem.RedirectURL!, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="news-carousel-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="news-carousel">
      <div className="carousel-container">
        {news.map((newsItem, index) => {
          const isActive = index === currentIndex;
          const isClickable = isActive && isValidUrl(newsItem.RedirectURL);
          return (
            <div
              key={newsItem.ID}
              className={`carousel-slide ${isActive ? "active" : ""}`}
              aria-hidden={!isActive}
            >
              <div className="slide-image-container">
                <img
                  src={newsItem.Image}
                  alt={newsItem.Content}
                  className="slide-image"
                />
                <div className="slide-overlay"></div>
              </div>
              <div
                className={`slide-content ${isClickable ? "clickable" : ""}`}
                {...(isClickable && {
                  onClick: () => handleContentClick(newsItem),
                  role: "button",
                  tabIndex: 0,
                })}
              >
                <h3 className="slide-title">{newsItem.Content}</h3>
                {isClickable && (
                  <span className="slide-link-indicator">Ver más información →</span>
                )}
              </div>
            </div>
          );
        })}
        {news.length > 1 && (
          <>
            <button
              className="carousel-control prev"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              aria-label="Noticia anterior"
            >
              <span>‹</span>
            </button>
            <button
              className="carousel-control next"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Siguiente noticia"
            >
              <span>›</span>
            </button>

            <div className="carousel-indicators">
              {news.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? "active" : ""
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  aria-label={`Ir a noticia ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NewsCarousel;
