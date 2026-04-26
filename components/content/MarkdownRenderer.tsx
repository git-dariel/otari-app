import { Text, View } from 'react-native';

type MarkdownRendererProps = {
  markdown: string;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const blocks = markdown.split('\n').filter(Boolean);

  return (
    <View className="gap-3">
      {blocks.map((block, index) => {
        if (block.startsWith('## ')) {
          return (
            <Text key={`${block}-${index}`} className="mt-3 text-xl font-black text-ink">
              {block.replace('## ', '')}
            </Text>
          );
        }

        if (block.startsWith('- ')) {
          return (
            <Text key={`${block}-${index}`} className="text-base leading-7 text-slate-700">
              • {block.replace('- ', '')}
            </Text>
          );
        }

        return (
          <Text key={`${block}-${index}`} className="text-base leading-7 text-slate-700">
            {block}
          </Text>
        );
      })}
    </View>
  );
}
