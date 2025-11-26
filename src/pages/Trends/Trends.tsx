import { useEffect, useState } from 'react';
import Sidebar from '@components/Sidebar/Sidebar';
import Topbar from '@components/Topbar/Topbar';
import TimeFrameSelector from '@components/TimeFrameSelector/TimeFrameSelector';
import TrendingViewSelector, { type TrendingView } from '@components/TrendingViewSelector/TrendingViewSelector';
import TrendingPostsSection from '@components/TrendingSection/TrendingPostsSection';
import TrendingCommentsSection from '@components/TrendingSection/TrendingCommentsSection';
import TrendingUsersSection from '@components/TrendingSection/TrendingUsersSection';
import { getTrendingPosts, getTrendingComments, getTrendingUsers } from '@/api';
import { useAppContext } from '@/context/AppContext';
import type { TimeFrame, TrendingPost, TrendingComment, TrendingUser } from '@/types/trending';
import './Trends.css';

function Trends() {
  const { currentUser, selectSpace } = useAppContext();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('24h');
  const [selectedView, setSelectedView] = useState<TrendingView>('posts');
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [trendingComments, setTrendingComments] = useState<TrendingComment[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);

  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  const PAGE_SIZE_POSTS = 9;
  const PAGE_SIZE_COMMENTS = 5;
  const PAGE_SIZE_USERS = 9;

  useEffect(() => {
    const fetchTrendingData = async () => {
      setIsLoadingPosts(true);
      setIsLoadingComments(true);
      setIsLoadingUsers(true);

      setPostsPage(1);
      setCommentsPage(1);
      setUsersPage(1);

      try {
        const [postsResponse, commentsResponse, usersResponse] = await Promise.all([
          getTrendingPosts(selectedTimeFrame, 1, PAGE_SIZE_POSTS),
          getTrendingComments(selectedTimeFrame, 1, PAGE_SIZE_COMMENTS),
          getTrendingUsers(selectedTimeFrame, 1, PAGE_SIZE_USERS),
        ]);

        setTrendingPosts(postsResponse.data);
        setTrendingComments(commentsResponse.data);
        setTrendingUsers(usersResponse.data);

        setHasMorePosts(postsResponse.data.length >= PAGE_SIZE_POSTS && postsResponse.total > PAGE_SIZE_POSTS);
        setHasMoreComments(commentsResponse.data.length >= PAGE_SIZE_COMMENTS && commentsResponse.total > PAGE_SIZE_COMMENTS);
        setHasMoreUsers(usersResponse.data.length >= PAGE_SIZE_USERS && usersResponse.total > PAGE_SIZE_USERS);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setIsLoadingPosts(false);
        setIsLoadingComments(false);
        setIsLoadingUsers(false);
      }
    };

    fetchTrendingData();
  }, [selectedTimeFrame]);

  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setSelectedTimeFrame(timeFrame);
  };
  const handleViewChange = (view: TrendingView) => {
    setSelectedView(view);
  };

  const handleLoadMorePosts = async () => {
    if (isLoadingMorePosts || !hasMorePosts) return;

    setIsLoadingMorePosts(true);
    const nextPage = postsPage + 1;

    try {
      const response = await getTrendingPosts(selectedTimeFrame, nextPage, PAGE_SIZE_POSTS);
      setTrendingPosts(prev => [...prev, ...response.data]);
      setPostsPage(nextPage);
      setHasMorePosts(response.data.length >= PAGE_SIZE_POSTS && (postsPage * PAGE_SIZE_POSTS + response.data.length) < response.total);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMorePosts(false);
    }
  };

  const handleLoadMoreComments = async () => {
    if (isLoadingMoreComments || !hasMoreComments) return;

    setIsLoadingMoreComments(true);
    const nextPage = commentsPage + 1;

    try {
      const response = await getTrendingComments(selectedTimeFrame, nextPage, PAGE_SIZE_COMMENTS);
      setTrendingComments(prev => [...prev, ...response.data]);
      setCommentsPage(nextPage);
      setHasMoreComments(response.data.length >= PAGE_SIZE_COMMENTS && (commentsPage * PAGE_SIZE_COMMENTS + response.data.length) < response.total);
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoadingMoreComments(false);
    }
  };

  const handleLoadMoreUsers = async () => {
    if (isLoadingMoreUsers || !hasMoreUsers) return;

    setIsLoadingMoreUsers(true);
    const nextPage = usersPage + 1;

    try {
      const response = await getTrendingUsers(selectedTimeFrame, nextPage, PAGE_SIZE_USERS);
      setTrendingUsers(prev => [...prev, ...response.data]);
      setUsersPage(nextPage);
      setHasMoreUsers(response.data.length >= PAGE_SIZE_USERS && (usersPage * PAGE_SIZE_USERS + response.data.length) < response.total);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  };

  return (
    <div className="trends-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="trends-container">
        <div className="trends-content">
          <div className="trends-header">
            <h1 className="trends-title"></h1>
            <p className="trends-subtitle">
              Descubre lo más popular de la comunidad
            </p>
          </div>

          <TrendingViewSelector selectedView={selectedView} onChange={handleViewChange} />

          <TimeFrameSelector
            selectedTimeFrame={selectedTimeFrame}
            onTimeFrameChange={handleTimeFrameChange}
          />


          <div className="trends-sections">
            {selectedView === 'posts' && (
              <TrendingPostsSection
                posts={trendingPosts}
                isLoading={isLoadingPosts}
                isLoadingMore={isLoadingMorePosts}
                hasMore={hasMorePosts}
                onLoadMore={handleLoadMorePosts}
              />
            )}
            {selectedView === 'comments' && (
              <TrendingCommentsSection
                comments={trendingComments}
                isLoading={isLoadingComments}
                isLoadingMore={isLoadingMoreComments}
                hasMore={hasMoreComments}
                onLoadMore={handleLoadMoreComments}
              />
            )}
            {selectedView === 'users' && (
              <TrendingUsersSection
                users={trendingUsers}
                isLoading={isLoadingUsers}
                isLoadingMore={isLoadingMoreUsers}
                hasMore={hasMoreUsers}
                onLoadMore={handleLoadMoreUsers}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trends;