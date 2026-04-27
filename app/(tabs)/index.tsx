import { Image } from "expo-image";
import { router } from "expo-router";
import { BookOpenCheck, ShieldCheck } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { Screen } from "@/components/common/Screen";
import { APP_NAME } from "@/constants/app";
import { getDocuments, getLessons } from "@/services/content/contentService";
import { INVESTMENT_TYPE_OPTIONS } from "@/services/portfolio/portfolioCatalog";
import { searchInvestmentAssets } from "@/services/portfolio/portfolioMarketService";
import {
  addPortfolioItem,
  deletePortfolioItem,
  getPortfolioItems,
  updatePortfolioItem,
} from "@/services/portfolio/portfolioService";
import type {
  CurrencyCode,
  InvestmentAsset,
  InvestmentType,
  PortfolioItem,
} from "@/types/portfolio";

const PATHWAY_BARS = [3, 5, 4, 7, 6, 9, 8] as const;

function getTickerFallbackIcon(symbol: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    symbol
  )}&background=e2e8f0&color=0f172a&rounded=true&size=96&bold=true&format=png`;
}

type AssetIconProps = {
  iconUrl: string;
  symbol: string;
  size: number;
  accessibilityLabel: string;
};

function AssetIcon({ iconUrl, symbol, size, accessibilityLabel }: AssetIconProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  return (
    <Image
      source={hasLoadError ? getTickerFallbackIcon(symbol) : iconUrl}
      style={{ height: size, width: size }}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
      onError={() => setHasLoadError(true)}
    />
  );
}

export default function HomeScreen() {
  const lessonCount = getLessons().length;
  const docCount = getDocuments().length;
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<InvestmentType | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAsset | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("PHP");
  const [amountInput, setAmountInput] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetOptions, setAssetOptions] = useState<InvestmentAsset[]>([]);
  const [isAssetSearchLoading, setIsAssetSearchLoading] = useState(false);
  const [assetSearchError, setAssetSearchError] = useState<string | null>(null);
  const [activePortfolioItem, setActivePortfolioItem] = useState<PortfolioItem | null>(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolio() {
      try {
        const items = await getPortfolioItems();

        if (isMounted) {
          setPortfolioItems(items);
          setPortfolioError(null);
        }
      } catch {
        if (isMounted) {
          setPortfolioError("Unable to load your portfolio right now.");
        }
      } finally {
        if (isMounted) {
          setIsPortfolioLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetModalState() {
    setSelectedType(null);
    setSelectedAsset(null);
    setSelectedCurrency("PHP");
    setAmountInput("");
    setAmountError(null);
    setModalMode("create");
    setEditingItemId(null);
    setAssetSearchQuery("");
    setAssetOptions([]);
    setAssetSearchError(null);
    setIsAssetSearchLoading(false);
    setIsSavingPortfolio(false);
  }

  function openAddModal() {
    resetModalState();
    setIsAddModalVisible(true);
  }

  function openEditModal(item: PortfolioItem) {
    setModalMode("edit");
    setEditingItemId(item.id);
    setSelectedType(item.type);
    setSelectedAsset({
      id: item.assetId,
      type: item.type,
      symbol: item.assetSymbol,
      name: item.assetName,
      iconUrl: item.iconUrl,
    });
    setSelectedCurrency(item.currency);
    setAmountInput(String(item.amount));
    setAmountError(null);
    setAssetSearchQuery(item.assetSymbol);
    setAssetOptions([]);
    setAssetSearchError(null);
    setIsAssetSearchLoading(false);
    setIsSavingPortfolio(false);
    setIsAddModalVisible(true);
  }

  function closeAddModal() {
    setIsAddModalVisible(false);
    resetModalState();
  }

  useEffect(() => {
    if (!selectedType || selectedAsset) {
      return;
    }

    const trimmedQuery = assetSearchQuery.trim();

    if (trimmedQuery.length < 2) {
      setAssetOptions([]);
      setAssetSearchError(null);
      setIsAssetSearchLoading(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setIsAssetSearchLoading(true);
    setAssetSearchError(null);

    const timeout = setTimeout(() => {
      searchInvestmentAssets(selectedType, trimmedQuery)
        .then((results) => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setAssetOptions(results);
          setAssetSearchError(null);
        })
        .catch(() => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setAssetSearchError("Unable to search assets right now.");
          setAssetOptions([]);
        })
        .finally(() => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setIsAssetSearchLoading(false);
        });
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [assetSearchQuery, selectedAsset, selectedType]);

  async function handleSavePortfolioItem() {
    const parsedAmount = Number(amountInput.trim());

    if (!selectedType || !selectedAsset || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Enter a valid amount greater than zero.");
      return;
    }

    try {
      setIsSavingPortfolio(true);
      setAmountError(null);
      const nextItems =
        modalMode === "edit" && editingItemId
          ? await updatePortfolioItem({
              id: editingItemId,
              asset: selectedAsset,
              amount: parsedAmount,
              currency: selectedCurrency,
            })
          : await addPortfolioItem({
              asset: selectedAsset,
              amount: parsedAmount,
              currency: selectedCurrency,
            });
      setPortfolioItems(nextItems);
      setPortfolioError(null);
      closeAddModal();
    } catch {
      setAmountError("Unable to save this item right now.");
    } finally {
      setIsSavingPortfolio(false);
    }
  }

  async function handleDeletePortfolioItem(id: string) {
    try {
      const nextItems = await deletePortfolioItem(id);
      setPortfolioItems(nextItems);
      setPortfolioError(null);
      setActivePortfolioItem(null);
    } catch {
      setPortfolioError("Unable to delete this item right now.");
    }
  }

  return (
    <Screen>
      {/* Page header — title + subtitle on the left, small pill CTA on the right */}
      <View className="mb-5 flex-row items-start justify-between pt-2">
        <View className="flex-1 pr-3">
          <Text className="text-3xl font-black text-ink">{APP_NAME}</Text>
        </View>
        <AppButton
          icon="auto-awesome"
          label="Ask Otari"
          onPress={() => router.push("/chatbot")}
          size="sm"
          variant="soft"
        />
      </View>

      {/* Hero pill — mascot avatar, eyebrow + headline, trailing icon */}
      <View className="mb-4 flex-row items-center rounded-[28px] bg-forest-50 p-4">
        <Image
          accessibilityLabel="Otari learning mascot"
          contentFit="contain"
          source={require("@/assets/character/character-main.png")}
          style={{ height: 72, width: 64 }}
        />
        <View className="ml-3 flex-1">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Your learning buddy
          </Text>
          <Text className="mt-0.5 text-xl font-black leading-tight text-ink">
            Learn investing safely.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
          <ShieldCheck color="#1d4ed8" size={20} strokeWidth={2.8} />
        </View>
      </View>

      {/* Two-column insight row — buddy quote + pathway mini-chart */}
      <View className="mb-4 flex-row gap-4">
        <View className="flex-1 rounded-[24px] bg-forest-50 px-4 py-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Meet your guide
          </Text>
          <Text className="mt-3 text-[13px] leading-6 text-slate-700">
            Learn muna before taking risk. I’ll point you to lessons, docs, and safer questions.
          </Text>
        </View>

        <View className="flex-1 rounded-[24px] bg-forest-50 px-4 py-5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-forest-700">
            Beginner pathway
          </Text>
          <View className="mt-4 h-12 flex-row items-end gap-1.5">
            {PATHWAY_BARS.map((unit, index) => (
              <View
                key={`pathway-bar-${index}`}
                className={`flex-1 rounded-sm ${
                  index === PATHWAY_BARS.length - 2 ? "bg-forest-600" : "bg-forest-200"
                }`}
                style={{ height: unit * 5 }}
              />
            ))}
          </View>
          <View className="mt-3 flex-row justify-between">
            <Text className="text-[10px] font-bold text-slate-500">{lessonCount} Lessons</Text>
            <Text className="text-[10px] font-bold text-slate-500">{docCount} Docs</Text>
          </View>
        </View>
      </View>

      {/* Learning shortcut card */}
      <AppCard className="mb-3" onPress={() => router.push("/learn")}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-forest-50">
              <BookOpenCheck color="#1d4ed8" size={22} strokeWidth={2.8} />
            </View>
            <View className="ml-3 flex-1 pr-2">
              <Text className="text-base font-black text-ink">Learning Screen</Text>
              <Text className="text-xs text-slate-500">Browse trusted creator profiles</Text>
            </View>
          </View>
          <AppButton
            icon="arrow-forward"
            label="Open"
            onPress={() => router.push("/learn")}
            size="sm"
            variant="soft"
          />
        </View>
      </AppCard>

      <AppCard className="mb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-black text-ink">My Portfolio</Text>
            <Text className="text-xs text-slate-500">Track what you already own or trade.</Text>
          </View>
          <AppButton
            icon="add-circle-outline"
            label="Add item"
            onPress={openAddModal}
            size="sm"
            variant="soft"
          />
        </View>

        <Text className="mt-4 text-sm leading-5 text-slate-600">
          Educational tracker only. This does not provide buy, sell, or hold advice.
        </Text>

        {isPortfolioLoading ? (
          <View className="mt-4 flex-row items-center">
            <ActivityIndicator color="#1d4ed8" />
            <Text className="ml-3 text-sm text-slate-500">Loading your portfolio...</Text>
          </View>
        ) : null}

        {!isPortfolioLoading && portfolioError ? (
          <Text className="mt-4 text-sm text-red-600">{portfolioError}</Text>
        ) : null}

        {!isPortfolioLoading && !portfolioError && !portfolioItems.length ? (
          <Text className="mt-4 text-sm text-slate-500">
            No items yet. Tap &quot;Add item&quot; to add your first holding.
          </Text>
        ) : null}

        {!isPortfolioLoading && !portfolioError && portfolioItems.length ? (
          <View className="mt-4 gap-2">
            {portfolioItems.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center rounded-2xl bg-forest-50 px-3 py-2.5"
                accessibilityRole="button"
                onPress={() => setActivePortfolioItem(item)}
              >
                <AssetIcon
                  iconUrl={item.iconUrl}
                  symbol={item.assetSymbol}
                  size={30}
                  accessibilityLabel={`${item.assetName} icon`}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-ink">{item.assetSymbol}</Text>
                  <Text className="text-xs text-slate-500">{item.assetName}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-black text-ink">
                    {item.currency} {item.amount.toLocaleString()}
                  </Text>
                  <Text className="text-[11px] uppercase text-slate-500">{item.type}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </AppCard>

      <Modal
        animationType="slide"
        transparent
        visible={isAddModalVisible}
        onRequestClose={closeAddModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[85%] rounded-t-[28px] bg-mist px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-black text-ink">
                {modalMode === "edit" ? "Edit Portfolio Item" : "Add Portfolio Item"}
              </Text>
              <Pressable accessibilityRole="button" onPress={closeAddModal}>
                <Text className="text-sm font-bold text-forest-700">Close</Text>
              </Pressable>
            </View>

            {!selectedType ? (
              <View className="gap-2">
                <Text className="mb-1 text-sm font-bold text-slate-700">
                  Step 1: Choose investment type
                </Text>
                {INVESTMENT_TYPE_OPTIONS.map((typeOption) => (
                  <Pressable
                    key={typeOption.id}
                    accessibilityRole="button"
                    className="rounded-2xl bg-white px-4 py-3"
                    onPress={() => setSelectedType(typeOption.id)}
                  >
                    <Text className="text-sm font-black text-ink">{typeOption.label}</Text>
                    <Text className="mt-1 text-xs text-slate-500">{typeOption.helperText}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {selectedType && !selectedAsset ? (
              <View className="gap-2">
                <Text className="mb-1 text-sm font-bold text-slate-700">
                  Step 2: Pick a {selectedType.toUpperCase()} asset
                </Text>
                <TextInput
                  className="rounded-2xl bg-white px-4 py-3 text-sm text-ink"
                  placeholder={`Search ${selectedType.toUpperCase()} (e.g. AAPL)`}
                  placeholderTextColor="#94a3b8"
                  value={assetSearchQuery}
                  onChangeText={setAssetSearchQuery}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                {isAssetSearchLoading ? (
                  <View className="flex-row items-center rounded-2xl bg-white px-4 py-3">
                    <ActivityIndicator color="#1d4ed8" />
                    <Text className="ml-2 text-xs text-slate-500">Searching assets...</Text>
                  </View>
                ) : null}

                {assetSearchError ? (
                  <Text className="text-xs text-red-600">{assetSearchError}</Text>
                ) : null}

                {!isAssetSearchLoading && !assetSearchError && assetSearchQuery.trim().length < 2 ? (
                  <Text className="text-xs text-slate-500">
                    Type at least 2 characters to search the market.
                  </Text>
                ) : null}

                {!isAssetSearchLoading &&
                !assetSearchError &&
                assetSearchQuery.trim().length >= 2 &&
                !assetOptions.length ? (
                  <Text className="text-xs text-slate-500">No matching assets found.</Text>
                ) : null}

                {assetOptions.length ? (
                  <View className="max-h-72">
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      <View className="gap-2 pb-1">
                        {assetOptions.map((asset) => (
                          <Pressable
                            key={asset.id}
                            accessibilityRole="button"
                            className="flex-row items-center rounded-2xl bg-white px-4 py-3"
                            onPress={() => setSelectedAsset(asset)}
                          >
                            <AssetIcon
                              iconUrl={asset.iconUrl}
                              symbol={asset.symbol}
                              size={28}
                              accessibilityLabel={`${asset.name} icon`}
                            />
                            <View className="ml-3 flex-1">
                              <Text className="text-sm font-black text-ink">{asset.symbol}</Text>
                              <Text className="text-xs text-slate-500">{asset.name}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            ) : null}

            {selectedType && selectedAsset ? (
              <View className="gap-3">
                <Text className="mb-1 text-sm font-bold text-slate-700">
                  Step 3: Enter how much you bought
                </Text>
                <View className="rounded-2xl bg-white p-4">
                  <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Amount
                  </Text>
                  <TextInput
                    className="rounded-xl border border-slate-200 px-3 py-2 text-base text-ink"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    value={amountInput}
                    onChangeText={setAmountInput}
                  />

                  <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Currency
                  </Text>
                  <View className="flex-row gap-2">
                    {(["PHP", "USD"] as const).map((currency) => (
                      <Pressable
                        key={currency}
                        accessibilityRole="button"
                        className={`rounded-full px-4 py-2 ${
                          selectedCurrency === currency ? "bg-forest-600" : "bg-forest-50"
                        }`}
                        onPress={() => setSelectedCurrency(currency)}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            selectedCurrency === currency ? "text-white" : "text-forest-700"
                          }`}
                        >
                          {currency}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {amountError ? (
                    <Text className="mt-3 text-xs font-medium text-red-600">{amountError}</Text>
                  ) : null}
                </View>

                <AppButton
                  icon="check-circle-outline"
                  label={
                    isSavingPortfolio
                      ? "Saving..."
                      : modalMode === "edit"
                        ? "Save changes"
                        : "Save item"
                  }
                  onPress={isSavingPortfolio ? undefined : handleSavePortfolioItem}
                />
              </View>
            ) : null}

            {selectedType ? (
              <View className="mt-4 flex-row justify-start">
                <Pressable
                  accessibilityRole="button"
                  className="rounded-full bg-forest-50 px-4 py-2"
                  onPress={() => {
                    if (selectedAsset) {
                      setSelectedAsset(null);
                      setAmountInput("");
                      setAmountError(null);
                      return;
                    }

                    setSelectedType(null);
                    setAssetSearchQuery("");
                    setAssetOptions([]);
                    setAssetSearchError(null);
                  }}
                >
                  <Text className="text-sm font-bold text-forest-700">Back</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(activePortfolioItem)}
        onRequestClose={() => setActivePortfolioItem(null)}
      >
        <View className="flex-1 items-center justify-end bg-black/40 px-5 pb-6">
          <View className="w-full max-w-[380px] rounded-3xl bg-white p-4">
            <Text className="text-base font-black text-ink">
              {activePortfolioItem?.assetSymbol} {activePortfolioItem?.assetName}
            </Text>
            <Text className="mt-1 text-xs text-slate-500">Choose what you want to do.</Text>

            <View className="mt-4 gap-2">
              <Pressable
                accessibilityRole="button"
                className="items-center rounded-2xl bg-forest-50 px-4 py-3"
                onPress={() => {
                  if (!activePortfolioItem) {
                    return;
                  }

                  setActivePortfolioItem(null);
                  openEditModal(activePortfolioItem);
                }}
              >
                <Text className="text-center text-sm font-bold text-forest-700">Edit item</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="items-center rounded-2xl bg-red-50 px-4 py-3"
                onPress={() => {
                  if (!activePortfolioItem) {
                    return;
                  }

                  handleDeletePortfolioItem(activePortfolioItem.id);
                }}
              >
                <Text className="text-center text-sm font-bold text-red-600">Delete item</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="items-center rounded-2xl bg-slate-100 px-4 py-3"
                onPress={() => setActivePortfolioItem(null)}
              >
                <Text className="text-center text-sm font-bold text-slate-600">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
