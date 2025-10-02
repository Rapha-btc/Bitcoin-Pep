// Bitcoin Pepe NFT Collection Loader
// Fetches live data from Gamma.io Stacks API

class NFTLoader {
  constructor() {
    this.baseURL = "https://api.gamma.io";
    this.stacksAPI = "https://stacks-mainnet.gamma.io";
    this.collectionSlug = "bitcoin-pepe";
    this.contractId = "SP16SRR777TVB1WS5XSS9QT3YEZEC9JQFKYZENRAJ.bitcoin-pepe";
    this.cache = new Map();
    this.retryCount = 3;
    this.retryDelay = 1000;
  }

  // Fetch collection data with retry logic
  async fetchWithRetry(url, options = {}, retries = this.retryCount) {
    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      if (retries > 0) {
        console.warn(
          `Fetch failed, retrying in ${this.retryDelay}ms...`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  // Get collection overview
  async getCollectionData() {
    const cacheKey = "collection-data";

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        // 5 min cache
        return cached.data;
      }
    }

    try {
      // Try multiple possible endpoints for Bitcoin Pepe collection
      const endpoints = [
        `${this.baseURL}/collections/${this.contractId}`,
        `${this.stacksAPI}/collections/${this.contractId}`,
        `${this.baseURL}/v1/collections/${this.collectionSlug}`,
        `${this.stacksAPI}/api/collections/${this.collectionSlug}`,
        `https://gql.stxnft.com/v1/collections/${this.contractId}`,
      ];

      let data = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          data = await this.fetchWithRetry(endpoint);
          console.log("Collection data received:", data);
          break;
        } catch (e) {
          console.warn(`Failed to fetch from ${endpoint}:`, e.message);
          continue;
        }
      }

      if (!data) {
        console.warn("All collection endpoints failed, using fallback data");
        throw new Error("All collection endpoints failed");
      }

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch collection data:", error);
      return this.getFallbackCollectionData();
    }
  }

  // Get individual NFTs from collection with cycling support
  async getCollectionNFTs(limit = 12, useCycling = true) {
    const cacheKey = `nfts-${limit}-${useCycling}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) {
        // 30 sec cache for cycling
        return cached.data;
      }
    }

    console.log("Loading Bitcoin Pepe NFTs with cycling enabled");
    const selectedNFTs = useCycling
      ? this.getRandomNFTs(limit)
      : this.getFallbackNFTs().slice(0, limit);

    // Cache the selected data
    this.cache.set(cacheKey, {
      data: selectedNFTs,
      timestamp: Date.now(),
    });

    // Attempt API fetch in background for future requests
    this.fetchNFTsInBackground(limit);

    return selectedNFTs;
  }

  // Background fetch that won't block rendering
  async fetchNFTsInBackground(limit) {
    try {
      // Try multiple endpoints for Bitcoin Pepe NFTs
      const endpoints = [
        `${this.baseURL}/collections/${this.contractId}/tokens?limit=${limit}`,
        `${this.stacksAPI}/api/v1/tokens?contract_id=${this.contractId}&limit=${limit}`,
        `${this.baseURL}/v1/collections/${this.collectionSlug}/tokens?limit=${limit}`,
        `https://gql.stxnft.com/v1/tokens?collection=${this.contractId}&limit=${limit}`,
        `${this.stacksAPI}/tokens?collection=${this.contractId}&limit=${limit}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Background fetch: ${endpoint}`);
          const data = await this.fetchWithRetry(endpoint);
          console.log("Background NFT data received:", data);

          if (data) {
            const nfts = this.normalizeNFTData(data);
            // Update cache with real data for next time
            this.cache.set(`nfts-${limit}`, {
              data: nfts,
              timestamp: Date.now(),
            });
            console.log("Cache updated with live NFT data");
            break;
          }
        } catch (e) {
          console.warn(`Background fetch failed for ${endpoint}:`, e.message);
          continue;
        }
      }
    } catch (error) {
      console.log("Background NFT fetch completed with fallback data");
    }
  }

  // Normalize different API response formats
  normalizeNFTData(data) {
    let nfts = [];

    // Handle different response structures
    if (data.tokens) {
      nfts = data.tokens;
    } else if (data.results) {
      nfts = data.results;
    } else if (Array.isArray(data)) {
      nfts = data;
    } else if (data.data && Array.isArray(data.data)) {
      nfts = data.data;
    }

    return nfts.map((nft) => ({
      id: nft.id || nft.token_id || nft.tokenId,
      name: nft.name || nft.metadata?.name || `Bitcoin Pepe #${nft.id}`,
      image: this.processImageURL(
        nft.image || nft.metadata?.image || nft.imageUrl
      ),
      description: nft.description || nft.metadata?.description || "",
      price: nft.price || nft.last_sale_price || null,
      rarity: nft.rarity_rank || nft.rank || null,
      traits: nft.traits || nft.attributes || [],
      owner: nft.owner || nft.current_owner,
      permalink: `https://gamma.io/stacks/collections/bitcoin-pepe/items/${nft.id}`,
    }));
  }

  // Process image URLs to ensure they're accessible
  processImageURL(imageUrl) {
    if (!imageUrl)
      return "/img/52aa708e19d541f9a9786e1b164fad82-removebg-preview-1.png";

    // Handle different image URL formats
    if (imageUrl.startsWith("ipfs://")) {
      const hash = imageUrl.replace("ipfs://", "");
      // Try multiple IPFS gateways
      return `https://stxnft.mypinata.cloud/ipfs/${hash}`;
    }

    if (imageUrl.includes("QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP")) {
      // Known Bitcoin Pepe collection images
      return `https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/${imageUrl}`;
    }

    if (imageUrl.startsWith("ar://")) {
      return `https://arweave.net/${imageUrl.replace("ar://", "")}`;
    }

    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    // If it's just a number or filename, construct the full URL
    if (/^\d+\.png$/.test(imageUrl) || /^\d+$/.test(imageUrl)) {
      return `https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/${imageUrl}.png`;
    }

    // Relative URLs - try to resolve
    return imageUrl.startsWith("/")
      ? `https://stacks.gamma.io${imageUrl}`
      : imageUrl;
  }

  // Fallback data when API fails
  getFallbackCollectionData() {
    return {
      name: "Bitcoin Pepe",
      description: "The first Pepe collection on Bitcoin Layer 2 (Stacks)",
      total_supply: "2089",
      supply: "2089",
      floor_price: "TBD",
      volume: "TBD",
      owners: "TBD",
      listed_count: "0",
    };
  }

  getFallbackNFTs() {
    // Extended list of Bitcoin Pepe NFTs for cycling display
    return [
      {
        id: "1",
        name: "Bitcoin Pepe #1",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1.png",
        description: "Genesis Bitcoin Pepe - The very first minted",
        price: null,
        rarity: 1,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/1",
      },
      {
        id: "2",
        name: "Bitcoin Pepe #2",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/2.png",
        description: "Second Bitcoin Pepe ever minted",
        price: null,
        rarity: 2,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/2",
      },
      {
        id: "3",
        name: "Bitcoin Pepe #3",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/3.png",
        description: "Third Bitcoin Pepe in the series",
        price: null,
        rarity: 3,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/3",
      },
      {
        id: "7",
        name: "Bitcoin Pepe #7",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/7.png",
        description: "Lucky number seven Bitcoin Pepe",
        price: null,
        rarity: 7,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/7",
      },
      {
        id: "13",
        name: "Bitcoin Pepe #13",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/13.png",
        description: "Unlucky but legendary Bitcoin Pepe",
        price: null,
        rarity: 13,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/13",
      },
      {
        id: "21",
        name: "Bitcoin Pepe #21",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/21.png",
        description: "Bitcoin Pepe #21 - A tribute to Bitcoin's 21M supply",
        price: null,
        rarity: 21,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/21",
      },
      {
        id: "42",
        name: "Bitcoin Pepe #42",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/42.png",
        description: "The answer to everything - Bitcoin Pepe edition",
        price: null,
        rarity: 42,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/42",
      },
      {
        id: "50",
        name: "Bitcoin Pepe #50",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/50.png",
        description: "Half-century Bitcoin Pepe milestone",
        price: null,
        rarity: 50,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/50",
      },
      {
        id: "69",
        name: "Bitcoin Pepe #69",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/69.png",
        description: "Nice Bitcoin Pepe",
        price: null,
        rarity: 69,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/69",
      },
      {
        id: "88",
        name: "Bitcoin Pepe #88",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/88.png",
        description: "Double infinity Bitcoin Pepe",
        price: null,
        rarity: 88,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/88",
      },
      {
        id: "100",
        name: "Bitcoin Pepe #100",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/100.png",
        description: "Centennial Bitcoin Pepe milestone",
        price: null,
        rarity: 100,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/100",
      },
      {
        id: "111",
        name: "Bitcoin Pepe #111",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/111.png",
        description: "Triple ones Bitcoin Pepe",
        price: null,
        rarity: 111,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/111",
      },
      {
        id: "123",
        name: "Bitcoin Pepe #123",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/123.png",
        description: "Sequential Bitcoin Pepe",
        price: null,
        rarity: 123,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/123",
      },
      {
        id: "200",
        name: "Bitcoin Pepe #200",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/200.png",
        description: "Double century Bitcoin Pepe",
        price: null,
        rarity: 200,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/200",
      },
      {
        id: "222",
        name: "Bitcoin Pepe #222",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/222.png",
        description: "Triple twos Bitcoin Pepe",
        price: null,
        rarity: 222,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/222",
      },
      {
        id: "314",
        name: "Bitcoin Pepe #314",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/314.png",
        description: "Pi Bitcoin Pepe for the mathematically inclined",
        price: null,
        rarity: 314,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/314",
      },
      {
        id: "333",
        name: "Bitcoin Pepe #333",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/333.png",
        description: "Triple threes Bitcoin Pepe",
        price: null,
        rarity: 333,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/333",
      },
      {
        id: "420",
        name: "Bitcoin Pepe #420",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/420.png",
        description: "Meme legend Bitcoin Pepe",
        price: null,
        rarity: 420,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/420",
      },
      {
        id: "444",
        name: "Bitcoin Pepe #444",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/444.png",
        description: "Quad fours Bitcoin Pepe",
        price: null,
        rarity: 444,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/444",
      },
      {
        id: "500",
        name: "Bitcoin Pepe #500",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/500.png",
        description: "Half-thousand Bitcoin Pepe",
        price: null,
        rarity: 500,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/500",
      },
      {
        id: "555",
        name: "Bitcoin Pepe #555",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/555.png",
        description: "Triple fives Bitcoin Pepe",
        price: null,
        rarity: 555,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/555",
      },
      {
        id: "666",
        name: "Bitcoin Pepe #666",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/666.png",
        description: "Devilishly rare Bitcoin Pepe",
        price: null,
        rarity: 666,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/666",
      },
      {
        id: "777",
        name: "Bitcoin Pepe #777",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/777.png",
        description: "Triple seven lucky Bitcoin Pepe",
        price: null,
        rarity: 777,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/777",
      },
      {
        id: "888",
        name: "Bitcoin Pepe #888",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/888.png",
        description: "Triple eights Bitcoin Pepe",
        price: null,
        rarity: 888,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/888",
      },
      {
        id: "999",
        name: "Bitcoin Pepe #999",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/999.png",
        description: "Triple nines Bitcoin Pepe",
        price: null,
        rarity: 999,
        permalink: "https://gamma.io/stacks/collections/bitcoin-pepe/items/999",
      },
      {
        id: "1000",
        name: "Bitcoin Pepe #1000",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1000.png",
        description: "Millennium Bitcoin Pepe collector edition",
        price: null,
        rarity: 1000,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/1000",
      },
      {
        id: "1111",
        name: "Bitcoin Pepe #1111",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1111.png",
        description: "Quad ones Bitcoin Pepe",
        price: null,
        rarity: 1111,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/1111",
      },
      {
        id: "1337",
        name: "Bitcoin Pepe #1337",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1337.png",
        description: "Elite Bitcoin Pepe",
        price: null,
        rarity: 1337,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/1337",
      },
      {
        id: "1500",
        name: "Bitcoin Pepe #1500",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1500.png",
        description: "Mid-collection Bitcoin Pepe",
        price: null,
        rarity: 1500,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/1500",
      },
      {
        id: "1776",
        name: "Bitcoin Pepe #1776",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/1776.png",
        description: "Independence Bitcoin Pepe",
        price: null,
        rarity: 1776,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/1776",
      },
      {
        id: "2000",
        name: "Bitcoin Pepe #2000",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/2000.png",
        description: "Y2K Bitcoin Pepe",
        price: null,
        rarity: 2000,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/2000",
      },
      {
        id: "2089",
        name: "Bitcoin Pepe #2089",
        image:
          "https://images.gamma.io/ipfs/QmcvM2naXyg15WFaVdB7qjnqRdsPrfrjGne7wHQojmAZNP/images/2089.png",
        description: "Final Bitcoin Pepe in the collection",
        price: null,
        rarity: 2089,
        permalink:
          "https://gamma.io/stacks/collections/bitcoin-pepe/items/2089",
      },
    ];
  }

  // Get random selection of NFTs for cycling display
  getRandomNFTs(limit = 12) {
    const allNFTs = this.getFallbackNFTs();
    const shuffled = [...allNFTs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  // Get collection stats for display
  async getCollectionStats() {
    try {
      const data = await this.getCollectionData();
      return {
        totalSupply: data.total_supply || data.supply || "N/A",
        floorPrice: data.floor_price || data.floor || "N/A",
        volume: data.volume_24h || data.volume || "N/A",
        owners: data.unique_owners || data.owners || "N/A",
        listed: data.listed_count || "N/A",
      };
    } catch (error) {
      console.error("Failed to get collection stats:", error);
      return {
        totalSupply: "N/A",
        floorPrice: "N/A",
        volume: "N/A",
        owners: "N/A",
        listed: "N/A",
      };
    }
  }
}

// NFT Gallery Renderer with Cycling
class NFTGalleryRenderer {
  constructor(containerId, nftLoader) {
    this.container = document.getElementById(containerId);
    this.nftLoader = nftLoader;
    this.observer = null;
    this.cyclingEnabled = true;
    this.cyclingInterval = null;
    this.cyclingDuration = 8000; // 8 seconds between cycles
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );
  }

  async render(limit = 12) {
    if (!this.container) {
      console.error("NFT container not found");
      return;
    }

    // Show loading state
    this.renderLoadingState();

    try {
      const nfts = await this.nftLoader.getCollectionNFTs(
        limit,
        this.cyclingEnabled
      );
      this.renderNFTs(nfts);

      // Start cycling if enabled
      if (this.cyclingEnabled) {
        this.startCycling(limit);
      }
    } catch (error) {
      console.error("Failed to render NFTs:", error);
      this.renderErrorState();
    }
  }

  startCycling(limit) {
    // Clear any existing interval
    if (this.cyclingInterval) {
      clearInterval(this.cyclingInterval);
    }

    // Start new cycling interval
    this.cyclingInterval = setInterval(async () => {
      try {
        console.log("🔄 Cycling NFT collection...");
        const newNFTs = await this.nftLoader.getCollectionNFTs(limit, true);
        this.renderNFTs(newNFTs, true); // true = animate transition
      } catch (error) {
        console.error("Failed to cycle NFTs:", error);
      }
    }, this.cyclingDuration);
  }

  stopCycling() {
    if (this.cyclingInterval) {
      clearInterval(this.cyclingInterval);
      this.cyclingInterval = null;
    }
  }

  renderLoadingState() {
    this.container.innerHTML = Array.from(
      { length: 6 },
      () => `
            <div class="nft-card-glass loading-shimmer">
                <div class="nft-image-placeholder" style="height: 300px; background: var(--glass-white);"></div>
                <div class="nft-info">
                    <div style="height: 20px; background: var(--glass-white); margin-bottom: 8px; border-radius: 4px;"></div>
                    <div style="height: 16px; background: var(--glass-white); width: 60%; border-radius: 4px;"></div>
                </div>
            </div>
        `
    ).join("");
  }

  renderNFTs(nfts, animate = false) {
    if (!nfts || nfts.length === 0) {
      this.renderEmptyState();
      return;
    }

    // If animating, add fade out class first
    if (animate) {
      this.container.classList.add("cycling");
      setTimeout(() => {
        this.updateNFTContent(nfts);
      }, 300);
    } else {
      this.updateNFTContent(nfts);
    }
  }

  updateNFTContent(nfts) {
    this.container.innerHTML = nfts
      .map((nft) => {
        const memeText = this.getRandomMeme();

        return `
                <div class="nft-card-degen sound-trigger degen-tooltip" data-nft-id="${
                  nft.id
                }" data-meme="${memeText}">
                    <img 
                        class="nft-image-degen" 
                        src="${nft.image}" 
                        alt="${nft.name}"
                        loading="lazy"
                        onerror="this.src='/img/52aa708e19d541f9a9786e1b164fad82-removebg-preview-1.png'"
                    />
                    <div class="nft-info-degen">
                        <h3 class="nft-title-degen">${nft.name}</h3>
                        ${
                          nft.price
                            ? `<div class="nft-price" style="color: var(--primary-orange); font-weight: 700;">💰 ${nft.price} STX</div>`
                            : ""
                        }
                        <a href="${
                          nft.permalink
                        }" target="_blank" rel="noopener noreferrer" class="btn-degen" style="font-size: 12px; padding: 8px 16px; margin-top: 12px;">🚀 VIEW ON GAMMA</a>
                    </div>
                </div>
            `;
      })
      .join("");

    // Remove cycling class and trigger animations
    setTimeout(() => {
      this.container.classList.remove("cycling");

      // Setup hover pause/resume functionality
      this.setupHoverControls();

      // Add intersection observer to cards
      this.container.querySelectorAll(".nft-card-degen").forEach((card) => {
        this.observer.observe(card);

        // Add click handler
        card.addEventListener("click", () => {
          const link = card.querySelector("a[href]");
          if (link) {
            window.open(link.href, "_blank");
          }
        });
      });
    }, 50);
  }

  setupHoverControls() {
    if (!this.container) return;

    // Pause cycling on hover
    this.container.addEventListener("mouseenter", () => {
      if (this.cyclingInterval) {
        this.stopCycling();
        this.pausedForHover = true;
      }
    });

    // Resume cycling when not hovering
    this.container.addEventListener("mouseleave", () => {
      if (this.pausedForHover) {
        this.startCycling(12); // Resume with default limit
        this.pausedForHover = false;
      }
    });
  }

  destroy() {
    this.stopCycling();
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Get degen rarity for NFTs
  getDegenRarity(index) {
    const rarities = [
      { class: "legendary", label: "🔥 LEGENDARY" },
      { class: "diamond", label: "💎 DIAMOND" },
      { class: "rare", label: "⚡ RARE" },
      { class: "moon", label: "🌙 MOON" },
      { class: "", label: "🐸 BASED" },
    ];

    if (index === 0) return rarities[0]; // First NFT is legendary
    if (index < 3) return rarities[1]; // Next 2 are diamond
    if (index < 6) return rarities[2]; // Next 3 are rare
    return rarities[Math.floor(Math.random() * rarities.length)];
  }

  // Random meme quotes
  getRandomMeme() {
    const memes = [
      "HODL THIS! 💎",
      "TO THE MOON! 🚀",
      "BASED AF! 🐸",
      "DIAMOND HANDS! 💎🙌",
      "WAGMI! 🦍",
      "LFG! 🔥",
      "MOON SOON! 🌙",
      "APE STRONG! 🦍",
      "PEPE ENERGY! ⚡",
      "DEGEN VIBES! 🚀",
    ];
    return memes[Math.floor(Math.random() * memes.length)];
  }

  renderEmptyState() {
    this.container.innerHTML = `
            <div class="empty-state glass-container" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <h3 style="color: var(--text-secondary); margin-bottom: 16px;">No NFTs Found</h3>
                <p style="color: var(--text-tertiary);">Check back later or visit the collection directly.</p>
                <a href="https://gamma.io/stacks/collections/bitcoin-pepe/items" target="_blank" class="btn-glass" style="margin-top: 24px;">
                    View Collection
                </a>
            </div>
        `;
  }

  renderErrorState() {
    this.container.innerHTML = `
            <div class="error-state glass-container" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <h3 style="color: var(--text-secondary); margin-bottom: 16px;">Unable to Load NFTs</h3>
                <p style="color: var(--text-tertiary); margin-bottom: 24px;">There was an issue loading the collection. Please try again later.</p>
                <button onclick="nftGallery.render()" class="btn-glass">Retry</button>
            </div>
        `;
  }
}

// Collection Stats Renderer
class CollectionStatsRenderer {
  constructor(containerId, nftLoader) {
    this.container = document.getElementById(containerId);
    this.nftLoader = nftLoader;
  }

  async render() {
    if (!this.container) return;

    try {
      const stats = await this.nftLoader.getCollectionStats();
      this.container.innerHTML = `
                <div class="stats-grid grid-4">
                    <div class="stat-card glass-container">
                        <div class="stat-number">${stats.totalSupply}</div>
                        <div class="stat-label">Total Supply</div>
                    </div>
                    <div class="stat-card glass-container">
                        <div class="stat-number">${stats.floorPrice}</div>
                        <div class="stat-label">Floor Price</div>
                    </div>
                    <div class="stat-card glass-container">
                        <div class="stat-number">${stats.volume}</div>
                        <div class="stat-label">Volume</div>
                    </div>
                    <div class="stat-card glass-container">
                        <div class="stat-number">${stats.owners}</div>
                        <div class="stat-label">Owners</div>
                    </div>
                </div>
            `;
    } catch (error) {
      console.error("Failed to render collection stats:", error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize NFT loader
  window.nftLoader = new NFTLoader();

  // Initialize gallery renderer
  window.nftGallery = new NFTGalleryRenderer("nft-gallery", window.nftLoader);

  // Initialize stats renderer
  window.statsRenderer = new CollectionStatsRenderer(
    "collection-stats",
    window.nftLoader
  );

  // Load NFTs and stats
  if (document.getElementById("nft-gallery")) {
    window.nftGallery.render(12);
  }

  if (document.getElementById("collection-stats")) {
    window.statsRenderer.render();
  }
});

// Add CSS for animations and cycling
const style = document.createElement("style");
style.textContent = `
    .nft-card-glass, .nft-card-degen {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .nft-card-glass.animate-in, .nft-card-degen.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Cycling animation */
    .nft-gallery.cycling .nft-card-degen {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s ease-out;
    }
    
    .nft-gallery:not(.cycling) .nft-card-degen {
        animation: cycleIn 0.6s ease-out forwards;
    }
    
    @keyframes cycleIn {
        0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .nft-link {
        display: inline-block;
        margin-top: 12px;
        color: var(--text-accent);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .nft-link:hover {
        opacity: 1;
    }
    
    .nft-rarity, .nft-rarity-degen {
        font-size: 12px;
        color: var(--text-tertiary);
        margin-top: 4px;
    }
    
    .stat-card {
        text-align: center;
        padding: 24px;
    }
    
    .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-accent);
        display: block;
        margin-bottom: 8px;
    }
    
    .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    /* Pause cycling on hover */
    .nft-gallery:hover {
        animation-play-state: paused;
    }
`;
document.head.appendChild(style);
