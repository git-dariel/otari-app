import { Text } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { BackButton } from '@/components/common/BackButton';
import { Screen } from '@/components/common/Screen';
import { EmptyState } from '@/components/common/StateViews';

export default function BookmarksScreen() {
  return (
    <Screen>
      <BackButton />
      <Text className="mb-3 text-4xl font-black text-ink">Bookmarks</Text>
      <Text className="mb-5 text-lg leading-7 text-slate-700">
        Saved learning sources and docs will appear here once bookmark storage is added in Phase 3.
      </Text>
      <AppCard>
        <EmptyState
          title="No bookmarks yet"
          message="Bookmark persistence is scheduled for Phase 3. For now, use Learn and Docs to browse content."
        />
      </AppCard>
    </Screen>
  );
}
