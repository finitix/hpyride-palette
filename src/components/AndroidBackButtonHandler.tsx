import { useAndroidBackButton } from '@/hooks/useAndroidBackButton';

/**
 * Component that handles Android hardware back button
 * Must be placed inside BrowserRouter
 */
const AndroidBackButtonHandler = () => {
  useAndroidBackButton();
  return null;
};

export default AndroidBackButtonHandler;
