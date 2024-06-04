import Button from '@app/components/Common/Button';
import JellyfinLogin from '@app/components/Login/JellyfinLogin';
import PlexLoginButton from '@app/components/PlexLoginButton';
import { useUser } from '@app/hooks/useUser';
import { MediaServerType } from '@server/constants/server';
import axios from 'axios';
import type React from 'react';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  signin: 'Sign in to your account',
  signinWithJellyfin: 'Enter your Jellyfin details',
  signinWithEmby: 'Enter your Emby details',
  signinWithPlex: 'Enter your Plex details',
  back: 'Go back',
});

interface LoginWithMediaServerProps {
  serverType: MediaServerType;
  onCancel: () => void;
  onComplete: () => void;
}

const SetupLogin: React.FC<LoginWithMediaServerProps> = ({
  serverType,
  onCancel,
  onComplete,
}) => {
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [mediaServerType, setMediaServerType] = useState<MediaServerType>(
    MediaServerType.NOT_CONFIGURED
  );
  const { user, revalidate } = useUser();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to login. If we get a success message, we will
  // ask swr to revalidate the user which _shouid_ come back with a valid user.

  useEffect(() => {
    const login = async () => {
      const response = await axios.post('/api/v1/auth/plex', {
        authToken: authToken,
      });

      if (response.data?.email) {
        revalidate();
      }
    };
    if (authToken && mediaServerType == MediaServerType.PLEX) {
      login();
    }
  }, [authToken, mediaServerType, revalidate]);

  useEffect(() => {
    if (user) {
      onComplete();
    }
  }, [user, mediaServerType, onComplete]);

  return (
    <div className="p-4">
      <div className="mb-2 flex justify-center text-xl font-bold">
        <FormattedMessage {...messages.signin} />
      </div>
      <div className="mb-2 flex justify-center pb-6 text-sm">
        {serverType === MediaServerType.JELLYFIN ? (
          <FormattedMessage {...messages.signinWithJellyfin} />
        ) : serverType === MediaServerType.EMBY ? (
          <FormattedMessage {...messages.signinWithEmby} />
        ) : (
          <FormattedMessage {...messages.signinWithPlex} />
        )}
      </div>
      {serverType === MediaServerType.PLEX && (
        <>
          <div
            className="px-10 py-8"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <PlexLoginButton
              onAuthToken={(authToken) => {
                setMediaServerType(MediaServerType.PLEX);
                setAuthToken(authToken);
              }}
            />
          </div>
          <div className="mt-4">
            <Button buttonType="default" onClick={() => onCancel()}>
              <FormattedMessage {...messages.back} />
            </Button>
          </div>
        </>
      )}
      {serverType === MediaServerType.JELLYFIN && (
        <JellyfinLogin
          initial={true}
          revalidate={revalidate}
          serverType={serverType}
          onCancel={onCancel}
        />
      )}
      {serverType === MediaServerType.EMBY && (
        <JellyfinLogin
          initial={true}
          revalidate={revalidate}
          serverType={serverType}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default SetupLogin;
