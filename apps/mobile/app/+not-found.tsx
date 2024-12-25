import { Link } from 'expo-router';
import { Box, Text, Heading, VStack } from '@ms-mobile-ui/themed';
import useI18n from '@milesight/shared/src/hooks/useI18n';

export default function NotFoundScreen() {
  const { getIntlText } = useI18n();

  return (
    <Box flex={1} alignItems="center" justifyContent="center" p="$4">
      <Heading
        //@ts-ignore
        size="2xl"
      >
        404
      </Heading>
      <Text mt="$2">{getIntlText('error.http.page_not_found')}</Text>
      <VStack mt="$3">
        <Link href="/(home)">
          <Text color="$primary600" mt="$1">返回</Text>
        </Link>
      </VStack>
    </Box>
  );
}
