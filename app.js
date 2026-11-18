const INITIAL_BOOKS = [
  {
    id: "B001",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Computer Science",
    isbn: "978-0132350884",
    barcode: "9780132350884",
    availability: "Available",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "B002",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    category: "Computer Science",
    isbn: "978-0201633610",
    barcode: "9780201633610",
    availability: "Issued",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "B003",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    category: "Computer Science",
    isbn: "978-0201616224",
    barcode: "9780201616224",
    availability: "Available",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "B004",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    isbn: "978-0553380163",
    barcode: "9780553380163",
    availability: "Available",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "B005",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    isbn: "978-0061120084",
    barcode: "9780061120084",
    availability: "Issued",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "B006",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    isbn: "978-0062316097",
    barcode: "9780062316097",
    availability: "Available",
    cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80"
  }
];

const INITIAL_MEMBERS = [
  { id: "M101", name: "Alex Morgan", email: "alex.morgan@univ.edu", phone: "+1 555-0192", status: "Active" },
  { id: "M102", name: "David Chen", email: "david.c@techcorp.com", phone: "+1 555-0348", status: "Active" },
  { id: "M103", name: "Sophia Martinez", email: "sophia.m@research.org", phone: "+1 555-0721", status: "Active" },
  { id: "M104", name: "Marcus Vance", email: "marcus.v@library.org", phone: "+1 555-0911", status: "Suspended" }
];

const INITIAL_TRANSACTIONS = [
  {
    id: "TX-901",
    bookId: "B002",
    bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
    memberId: "M101",
    memberName: "Alex Morgan",
    issueDate: "2026-09-01",
    dueDate: "2026-09-15",
    returnDate: null,
    fineAmount: 12.00,
    finePaid: false,
    status: "Overdue"
  },
  {
    id: "TX-902",
    bookId: "B005",
    bookTitle: "To Kill a Mockingbird",
    memberId: "M102",
    memberName: "David Chen",
    issueDate: "2026-09-20",
    dueDate: "2026-10-04",
    returnDate: null,
    fineAmount: 0.00,
    finePaid: true,
    status: "Issued"
  }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "Book 'Design Patterns' is 12 days overdue for member Alex Morgan.", time: "10 mins ago" },
  { id: 2, text: "New book 'Sapiens' barcode scanned and catalogued.", time: "1 hour ago" },
  { id: 3, text: "UN SDG 4 quarterly library circulation target met!", time: "1 day ago" }
];

class LibraryApp {
  constructor() {
    this.books = [];
    this.members = [];
    this.transactions = [];
    this.notifications = [];

    this.html5QrCode = null;
    this.currentView = "grid";

    this.init();
  }

  
  async init() {
    try {
      const [booksData, membersData, transactionsData] =
        await Promise.all([
          this.apiRequest("/api/books"),
          this.apiRequest("/api/members"),
          this.apiRequest("/api/transactions")
        ]);

      this.books = booksData.data || [];
      this.members = membersData.data || [];
      this.transactions = transactionsData.data || [];

      this.registerDomEvents();
      this.updateDashboardStats();
      this.renderCatalogue();
      this.renderRecentTransactions();
      this.renderFullTransactions();
      this.renderMembers();
      this.renderFines();
      this.renderNotifications();
      this.populateDropdowns();
      this.renderTestBarcodes();
      this.initBarcodeCanvas("9780132350884");

      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (error) {
      console.error("SmartLib initialization failed:", error);
      alert("Unable to connect to SmartLib backend. Please check that the server is running.");
    }
  }

  async apiRequest(endpoint, options = {}) {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Something went wrong.");
    }

    return result;
  }


  async apiRequest(endpoint, options = {}) {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let iconName = type === "success" ? "check-circle" : type === "error" ? "alert-triangle" : "info";
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  addNotification(text) {
    const newNotif = {
      id: Date.now(),
      text,
      time: "Just now"
    };
    this.notifications.unshift(newNotif);
    
    this.renderNotifications();
  }

  renderNotifications() {
    const list = document.getElementById("notifList");
    const badge = document.getElementById("notifBadge");
    badge.textContent = this.notifications.length;
    
    if (this.notifications.length === 0) {
      list.innerHTML = `<div style="padding:1rem; text-align:center; color: var(--text-dim);">No active notifications</div>`;
      return;
    }

    list.innerHTML = this.notifications.map(n => `
      <div class="notif-item">
        <p>${n.text}</p>
        <span style="font-size:0.68rem; color: var(--text-dim); display:block; margin-top:3px;">${n.time}</span>
      </div>
    `).join('');
  }

  registerDomEvents() {
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabTarget = btn.getAttribute("data-tab");
        this.switchTab(tabTarget);
      });
    });

    document.getElementById("quickScanBtn").addEventListener("click", () => {
      this.switchTab("barcode-scanner");
    });
    document.getElementById("addBookHeaderBtn").addEventListener("click", () => {
      this.openBookModal();
    });
    document.getElementById("viewAllTransBtn").addEventListener("click", () => {
      this.switchTab("issue-return");
    });

    document.getElementById("themeToggleBtn").addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      document.body.classList.toggle("dark-theme");
      this.showToast("Theme preference updated", "info");
    });

    document.getElementById("notifBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("notifDropdown").classList.toggle("show");
    });
    document.getElementById("clearNotifs").addEventListener("click", () => {
      this.notifications = [];
      
      this.renderNotifications();
    });
    document.addEventListener("click", () => {
      document.getElementById("notifDropdown").classList.remove("show");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("globalSearchInput").focus();
      }
    });

    document.getElementById("globalSearchInput").addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length > 0) {
        this.switchTab("catalogue");
        document.getElementById("catalogueSearchInput").value = query;
        this.renderCatalogue(query);
      }
    });

    document.getElementById("catalogueSearchInput").addEventListener("input", (e) => {
      this.renderCatalogue(e.target.value.trim().toLowerCase());
    });
    document.getElementById("categoryFilter").addEventListener("change", () => this.renderCatalogue());
    document.getElementById("availabilityFilter").addEventListener("change", () => this.renderCatalogue());
    document.getElementById("gridViewBtn").addEventListener("click", () => {
      this.currentView = "grid";
      document.getElementById("gridViewBtn").classList.add("active");
      document.getElementById("listViewBtn").classList.remove("active");
      document.getElementById("booksGridContainer").classList.remove("hidden");
      document.getElementById("booksTableContainer").classList.add("hidden");
    });
    document.getElementById("listViewBtn").addEventListener("click", () => {
      this.currentView = "list";
      document.getElementById("listViewBtn").classList.add("active");
      document.getElementById("gridViewBtn").classList.remove("active");
      document.getElementById("booksGridContainer").classList.add("hidden");
      document.getElementById("booksTableContainer").classList.remove("hidden");
    });

    document.getElementById("addNewBookBtn").addEventListener("click", () => this.openBookModal());
    document.getElementById("closeBookModal").addEventListener("click", () => this.closeBookModal());
    document.getElementById("cancelBookModal").addEventListener("click", () => this.closeBookModal());
    document.getElementById("bookForm").addEventListener("submit", (e) => this.handleSaveBook(e));

    document.getElementById("addNewMemberBtn").addEventListener("click", () => this.openMemberModal());
    document.getElementById("closeMemberModal").addEventListener("click", () => this.closeMemberModal());
    document.getElementById("cancelMemberModal").addEventListener("click", () => this.closeMemberModal());
    document.getElementById("memberForm").addEventListener("submit", (e) => this.handleSaveMember(e));

    document.getElementById("autoGenerateBarcodeBtn").addEventListener("click", () => {
      const randomBarcode = "978" + Math.floor(100000000 + Math.random() * 900000000);
      document.getElementById("bookBarcodeInput").value = randomBarcode;
      if (!document.getElementById("bookIsbnInput").value) {
        document.getElementById("bookIsbnInput").value = "978-" + randomBarcode.slice(3, 12);
      }
    });

    document.getElementById("modalFetchIsbnBtn")?.addEventListener("click", () => {
      const query = document.getElementById("modalIsbnQueryInput").value.trim();
      this.autoFillModalFromIsbn(query);
    });
    document.getElementById("modalIsbnQueryInput")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.autoFillModalFromIsbn(e.target.value.trim());
      }
    });
    document.getElementById("modalLookupFromIsbnFieldBtn")?.addEventListener("click", () => {
      const isbn = document.getElementById("bookIsbnInput").value.trim();
      this.autoFillModalFromIsbn(isbn);
    });

    document.getElementById("manualIsbnSearchBtn")?.addEventListener("click", () => {
      const code = document.getElementById("manualIsbnScanInput").value.trim();
      if (code) this.scanAndLookupIsbn(code);
      else this.showToast("Please enter an ISBN or barcode", "error");
    });
    document.getElementById("manualIsbnScanInput")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = e.target.value.trim();
        if (code) this.scanAndLookupIsbn(code);
        else this.showToast("Please enter an ISBN or barcode", "error");
      }
    });

    document.getElementById("barcodeFileInput")?.addEventListener("change", async (e) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      await this.handleBarcodeImageUpload(file);
      e.target.value = "";
    });

    document.getElementById("quickAutofillBtn").addEventListener("click", () => {
      const barcodeVal = document.getElementById("quickBarcodeScanInput").value.trim();
      this.processQuickScan(barcodeVal);
    });
    document.getElementById("quickBarcodeScanInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.processQuickScan(e.target.value.trim());
      }
    });

    document.getElementById("issueDate").valueAsDate = new Date();
    this.updateCalculatedDueDate();
    document.getElementById("issueDate").addEventListener("change", () => this.updateCalculatedDueDate());
    document.getElementById("issueDays").addEventListener("input", () => this.updateCalculatedDueDate());
    document.getElementById("issueBookForm").addEventListener("submit", (e) => this.handleIssueBook(e));

    document.getElementById("returnDate").valueAsDate = new Date();
    document.getElementById("returnSelectTransaction").addEventListener("change", () => this.updateReturnFinePreview());
    document.getElementById("returnDate").addEventListener("change", () => this.updateReturnFinePreview());
    document.getElementById("returnBookForm").addEventListener("submit", (e) => this.handleReturnBook(e));

    document.getElementById("generateBarcodeBtn").addEventListener("click", () => {
      const code = document.getElementById("generatorInput").value.trim();
      if (code) this.initBarcodeCanvas(code);
    });

    document.getElementById("copyBarcodeBtn").addEventListener("click", () => {
      const val = document.getElementById("detectedBarcodeValue").textContent;
      if (val && val !== "No Barcode Scanned Yet") {
        navigator.clipboard.writeText(val);
        this.showToast(`Barcode ${val} copied to clipboard!`, "success");
      }
    });

    document.getElementById("startCamBtn").addEventListener("click", () => this.startCameraScanner());
    document.getElementById("stopCamBtn").addEventListener("click", () => this.stopCameraScanner());
    document.getElementById("issueScanModalBtn").addEventListener("click", () => {
      this.switchTab("barcode-scanner");
      this.showToast("Align barcode with camera or pick sample code below", "info");
    });
  }

  switchTab(tabId) {
    document.querySelectorAll(".nav-item").forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    document.querySelectorAll(".tab-page").forEach(page => {
      if (page.id === `${tabId}-tab`) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });
  }

  updateDashboardStats() {
    const totalBooks = this.books.length;
    const availableBooks = this.books.filter(b => b.availability === "Available").length;
    const issuedBooks = this.books.filter(b => b.availability === "Issued").length;
    const overdueCount = this.transactions.filter(t => t.status === "Overdue").length;
    
    const totalMembers = this.members.length;
    const activeMembers = this.members.filter(m => m.status === "Active").length;

    const totalFines = this.transactions.reduce((acc, t) => acc + (t.finePaid ? 0 : t.fineAmount), 0);
    const collectedFines = this.transactions.reduce((acc, t) => acc + (t.finePaid ? t.fineAmount : 0), 0);

    document.getElementById("statTotalBooks").textContent = totalBooks;
    document.getElementById("statAvailableBooks").textContent = `${availableBooks} Available`;
    document.getElementById("statIssuedBooks").textContent = issuedBooks;
    document.getElementById("statOverdueBooks").textContent = `${overdueCount} Overdue`;
    document.getElementById("statTotalMembers").textContent = totalMembers;
    document.getElementById("statActiveMembers").textContent = `${activeMembers} Active`;
    document.getElementById("statTotalFines").textContent = `$${totalFines.toFixed(2)}`;
    document.getElementById("statCollectedFines").textContent = `$${collectedFines.toFixed(2)} Paid`;

    document.getElementById("pendingOverduesCount").textContent = overdueCount;
    document.getElementById("unpaidFinesTotal").textContent = `$${totalFines.toFixed(2)}`;
    document.getElementById("paidFinesTotal").textContent = `$${collectedFines.toFixed(2)}`;
  }

  renderCatalogue(searchQuery = "") {
    const categoryFilter = document.getElementById("categoryFilter").value;
    const availFilter = document.getElementById("availabilityFilter").value;

    const filtered = this.books.filter(book => {
      const matchesSearch = !searchQuery || 
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery) ||
        book.isbn.toLowerCase().includes(searchQuery) ||
        book.barcode.includes(searchQuery) ||
        book.category.toLowerCase().includes(searchQuery);

      const matchesCat = categoryFilter === "all" || book.category === categoryFilter;
      const matchesAvail = availFilter === "all" || 
        (availFilter === "available" && book.availability === "Available") ||
        (availFilter === "issued" && book.availability === "Issued");

      return matchesSearch && matchesCat && matchesAvail;
    });

    const gridContainer = document.getElementById("booksGridContainer");
    const tableBody = document.getElementById("booksTableBody");

    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align:center; color: var(--text-muted);" class="glass-card">No books found matching your criteria.</div>`;
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No books found matching your criteria.</td></tr>`;
      return;
    }

    gridContainer.innerHTML = filtered.map(b => `
      <div class="glass-card book-card">
        <div class="book-cover-container">
          ${b.cover ? `<img src="${b.cover}" alt="${b.title}" class="book-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
          <div class="book-cover-fallback" style="${b.cover ? 'display:none;' : ''}">
            <i data-lucide="book-open" style="width:40px; height:40px;"></i>
            <span style="font-size:0.75rem;">SmartLib Catalogue</span>
          </div>
          <span class="badge-status ${b.availability.toLowerCase()} book-badge">${b.availability}</span>
        </div>
        <div class="book-body">
          <h3 class="book-title">${b.title}</h3>
          <p class="book-author">By ${b.author}</p>
          <div class="book-meta-list">
            <span><strong>Category:</strong> ${b.category}</span>
            <span><strong>ISBN:</strong> ${b.isbn}</span>
            <span><strong>Barcode:</strong> ${b.barcode}</span>
          </div>
          <div class="book-barcode-svg">
            <svg id="barcode-svg-${b.id}"></svg>
          </div>
          <div class="book-card-actions">
            <button class="btn secondary" style="flex:1;" onclick="app.editBook('${b.id}')"><i data-lucide="edit"></i> Edit</button>
            <button class="btn danger" style="padding: 0.6rem;" onclick="app.deleteBook('${b.id}')"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
      </div>
    `).join('');

    tableBody.innerHTML = filtered.map(b => `
      <tr>
        <td><code>${b.barcode}</code></td>
        <td>
          <strong>${b.title}</strong><br>
          <span style="font-size:0.78rem; color:var(--text-muted);">${b.author}</span>
        </td>
        <td>${b.category}</td>
        <td>${b.isbn}</td>
        <td><span class="badge-status ${b.availability.toLowerCase()}">${b.availability}</span></td>
        <td>
          <button class="btn secondary" style="padding:0.4rem 0.8rem;" onclick="app.editBook('${b.id}')">Edit</button>
          <button class="btn danger" style="padding:0.4rem 0.8rem;" onclick="app.deleteBook('${b.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

    filtered.forEach(b => {
      try {
        JsBarcode(`#barcode-svg-${b.id}`, b.barcode, {
          format: "CODE128",
          width: 1.5,
          height: 35,
          displayValue: false
        });
      } catch (err) {
        console.error("Barcode generation error", err);
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  populateDropdowns() {
    const issueBookSelect = document.getElementById("issueSelectBook");
    const availableBooks = this.books.filter(b => b.availability === "Available");

    issueBookSelect.innerHTML = `<option value="">-- Choose Available Book --</option>` +
      availableBooks.map(b => `<option value="${b.id}">${b.title} (Barcode: ${b.barcode})</option>`).join('');

    const issueMemberSelect = document.getElementById("issueSelectMember");
    const activeMembers = this.members.filter(m => m.status === "Active");

    issueMemberSelect.innerHTML = `<option value="">-- Choose Active Library Member --</option>` +
      activeMembers.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('');

    const returnTransSelect = document.getElementById("returnSelectTransaction");
    const activeTrans = this.transactions.filter(t => t.returnDate === null);

    returnTransSelect.innerHTML = `<option value="">-- Choose Currently Issued Transaction --</option>` +
      activeTrans.map(t => `<option value="${t.id}">${t.bookTitle} (Member: ${t.memberName})</option>`).join('');
  }

  async processQuickScan(barcodeVal) {
    if (!barcodeVal) {
      this.showToast("Please enter or scan a barcode", "error");
      return;
    }

    const clean = barcodeVal.replace(/[^0-9X]/gi, "");
    const foundBook = this.books.find(b => 
      b.barcode === clean || 
      b.barcode === barcodeVal || 
      b.isbn.replace(/[^0-9X]/gi, "") === clean ||
      b.isbn === barcodeVal
    );

    const resultBox = document.getElementById("quickScanResult");
    const loading = document.getElementById("quickSearchLoading");
    const issueBtn = document.getElementById("quickIssueBookBtn");
    const returnBtn = document.getElementById("quickReturnBookBtn");
    const addBtn = document.getElementById("quickAddBookBtn");
    const sourceBadge = document.getElementById("scannedSourceBadge");

    if (foundBook) {
      this.playBeep();
      document.getElementById("scannedTitle").textContent = foundBook.title;
      document.getElementById("scannedAuthor").textContent = `By ${foundBook.author} | ISBN: ${foundBook.isbn}`;
      
      const statusBadge = document.getElementById("scannedStatus");
      statusBadge.textContent = foundBook.availability;
      statusBadge.className = `badge-status ${foundBook.availability.toLowerCase()}`;
      
      sourceBadge.classList.add("hidden");
      addBtn?.classList.add("hidden");

      if (foundBook.cover) {
        document.getElementById("scannedCover").innerHTML = `<img src="${foundBook.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" onerror="this.parentElement.innerHTML='<i data-lucide=book></i>'">`;
      } else {
        document.getElementById("scannedCover").innerHTML = `<i data-lucide="book"></i>`;
      }

      resultBox.classList.remove("hidden");
      this.showToast(`Found book '${foundBook.title}' in library collection!`, "success");

      if (foundBook.availability === "Available") {
        issueBtn.style.display = "inline-flex";
        returnBtn.style.display = "none";
        issueBtn.onclick = () => {
          this.switchTab("issue-return");
          document.getElementById("issueSelectBook").value = foundBook.id;
        };
      } else {
        issueBtn.style.display = "none";
        returnBtn.style.display = "inline-flex";
        returnBtn.onclick = () => {
          this.switchTab("issue-return");
          const activeTx = this.transactions.find(t => t.bookId === foundBook.id && t.returnDate === null);
          if (activeTx) {
            document.getElementById("returnSelectTransaction").value = activeTx.id;
            this.updateReturnFinePreview();
          }
        };
      }

      if (window.lucide) window.lucide.createIcons();
      return;
    }

    loading?.classList.remove("hidden");
    resultBox.classList.add("hidden");

    try {
      const isbnBook = await this.fetchBookFromIsbnDatabase(clean || barcodeVal);
      loading?.classList.add("hidden");

      if (!isbnBook) {
        this.showToast(`No book found for barcode ${barcodeVal} in library or ISBN database`, "error");
        return;
      }

      this.playBeep();
      this.lastQuickScannedIsbnBook = isbnBook;
      document.getElementById("scannedTitle").textContent = isbnBook.title;
      document.getElementById("scannedAuthor").textContent = `By ${isbnBook.author} | ISBN: ${isbnBook.isbn}`;

      const statusBadge = document.getElementById("scannedStatus");
      statusBadge.textContent = "New (ISBN Database)";
      statusBadge.className = "badge-status pending";

      sourceBadge.textContent = isbnBook.source || "ISBN Database";
      sourceBadge.classList.remove("hidden");

      if (isbnBook.cover) {
        document.getElementById("scannedCover").innerHTML = `<img src="${isbnBook.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" onerror="this.parentElement.innerHTML='<i data-lucide=book></i>'">`;
      } else {
        document.getElementById("scannedCover").innerHTML = `<i data-lucide="book"></i>`;
      }

      issueBtn.style.display = "none";
      returnBtn.style.display = "none";
      addBtn?.classList.remove("hidden");

      addBtn.onclick = async () => {
        const added = await this.addScannedBookToLibrary(isbnBook);

        if (added) {
          this.processQuickScan(added.barcode);
        }
      };

      resultBox.classList.remove("hidden");
      this.showToast(`Found "${isbnBook.title}" in global ISBN database!`, "success");
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      loading?.classList.add("hidden");
      console.error(err);
      this.showToast("Error querying ISBN database", "error");
    }
  }

  openBookModal(bookToEdit = null) {
    const modal = document.getElementById("bookModal");
    const title = document.getElementById("bookModalTitle");
    const form = document.getElementById("bookForm");
    const isbnBanner = document.getElementById("modalIsbnBanner");
    const coverPreview = document.getElementById("modalCoverPreview");

    form.reset();
    coverPreview?.classList.add("hidden");

    if (bookToEdit) {
      title.textContent = "Edit Book Details";
      isbnBanner?.classList.add("hidden");
      document.getElementById("bookIdInput").value = bookToEdit.id;
      document.getElementById("bookTitleInput").value = bookToEdit.title;
      document.getElementById("bookAuthorInput").value = bookToEdit.author;
      document.getElementById("bookCategoryInput").value = bookToEdit.category;
      document.getElementById("bookIsbnInput").value = bookToEdit.isbn;
      document.getElementById("bookBarcodeInput").value = bookToEdit.barcode;
      document.getElementById("bookCoverInput").value = bookToEdit.cover || "";

      if (bookToEdit.cover) {
        document.getElementById("modalCoverImg").src = bookToEdit.cover;
        document.getElementById("modalPreviewTitle").textContent = bookToEdit.title;
        document.getElementById("modalPreviewMeta").textContent = `${bookToEdit.author} • ${bookToEdit.category}`;
        coverPreview?.classList.remove("hidden");
      }
    } else {
      title.textContent = "Add New Book";
      isbnBanner?.classList.remove("hidden");
      document.getElementById("bookIdInput").value = "";
      if (document.getElementById("modalIsbnQueryInput")) {
        document.getElementById("modalIsbnQueryInput").value = "";
      }
    }

    modal.classList.add("active");
  }

  closeBookModal() {
    document.getElementById("bookModal").classList.remove("active");
  }

  
  async handleSaveBook(e) {
    e.preventDefault();

    const id = document.getElementById("bookIdInput").value;
    const title = document.getElementById("bookTitleInput").value.trim();
    const author = document.getElementById("bookAuthorInput").value.trim();
    const category = document.getElementById("bookCategoryInput").value;
    const isbn = document.getElementById("bookIsbnInput").value.trim();
    const barcode = document.getElementById("bookBarcodeInput").value.trim();
    const cover = document.getElementById("bookCoverInput").value.trim();

    const bookData = {
      title,
      author,
      category,
      isbn,
      barcode,
      cover
    };

    try {
      if (id) {
        await this.apiRequest(`/api/books/${id}`, {
          method: "PUT",
          body: JSON.stringify(bookData)
        });

        this.showToast(`Book '${title}' updated successfully`, "success");

      } else {
        await this.apiRequest("/api/books", {
          method: "POST",
          body: JSON.stringify(bookData)
        });

        this.showToast(`Book '${title}' added to catalogue`, "success");
        this.addNotification(`New book '${title}' catalogued with barcode ${barcode}`);
      }

      const booksData = await this.apiRequest("/api/books");
      this.books = booksData.data || [];

      this.renderCatalogue();
      this.updateDashboardStats();
      this.populateDropdowns();
      this.closeBookModal();

    } catch (error) {
      console.error("Book save failed:", error);
      this.showToast(error.message || "Unable to save book", "error");
    }
  }


  editBook(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (book) this.openBookModal(book);
  }

  
  async deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book record?")) {
      return;
    }

    try {
      await this.apiRequest(`/api/books/${bookId}`, {
        method: "DELETE"
      });

      const booksData = await this.apiRequest("/api/books");
      this.books = booksData.data || [];

      this.renderCatalogue();
      this.updateDashboardStats();
      this.populateDropdowns();

      this.showToast("Book deleted from inventory", "success");

    } catch (error) {
      console.error("Book deletion failed:", error);
      this.showToast(error.message || "Unable to delete book", "error");
    }
  }


  openMemberModal() {
    document.getElementById("memberForm").reset();
    document.getElementById("memberModal").classList.add("active");
  }

  closeMemberModal() {
    document.getElementById("memberModal").classList.remove("active");
  }

  
  async handleSaveMember(e) {
    e.preventDefault();

    const name = document.getElementById("memberNameInput").value.trim();
    const email = document.getElementById("memberEmailInput").value.trim();
    const phone = document.getElementById("memberPhoneInput").value.trim();

    const memberData = {
      name,
      email,
      phone
    };

    try {
      await this.apiRequest("/api/members", {
        method: "POST",
        body: JSON.stringify(memberData)
      });

      const membersData = await this.apiRequest("/api/members");
      this.members = membersData.data || [];

      this.renderMembers();
      this.updateDashboardStats();
      this.populateDropdowns();
      this.closeMemberModal();

      this.showToast(`Member ${name} registered successfully!`, "success");
      this.addNotification(`New member ${name} registered`);

    } catch (error) {
      console.error("Member registration failed:", error);
      this.showToast(error.message || "Unable to register member", "error");
    }
  }


  renderMembers() {
    const body = document.getElementById("membersTableBody");
    body.innerHTML = this.members.map(m => {
      const memberTx = this.transactions.filter(t => t.memberId === m.id && t.returnDate === null);
      const activeLoansCount = memberTx.length;
      const unpaidFineTotal = this.transactions
        .filter(t => t.memberId === m.id && !t.finePaid)
        .reduce((sum, t) => sum + t.fineAmount, 0);

      return `
        <tr>
          <td><code>${m.id}</code></td>
          <td><strong>${m.name}</strong></td>
          <td>
            ${m.email}<br>
            <span style="font-size:0.75rem; color:var(--text-dim);">${m.phone}</span>
          </td>
          <td><span class="badge-status ${activeLoansCount > 0 ? 'pending' : 'available'}">${activeLoansCount} Active</span></td>
          <td><span class="badge-status ${m.status.toLowerCase()}">${m.status}</span></td>
          <td>${unpaidFineTotal > 0 ? `<strong class="text-danger">$${unpaidFineTotal.toFixed(2)}</strong>` : '$0.00'}</td>
          <td>
            <button class="btn secondary" style="padding:0.4rem 0.6rem;" onclick="app.toggleMemberStatus('${m.id}')">Toggle Status</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  
  async toggleMemberStatus(memberId) {
    const member = this.members.find(m => m.id === memberId);

    if (!member) return;

    const newStatus = member.status === "Active" ? "Suspended" : "Active";

    try {
      await this.apiRequest(`/api/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus
        })
      });

      const membersData = await this.apiRequest("/api/members");
      this.members = membersData.data || [];

      this.renderMembers();
      this.updateDashboardStats();
      this.populateDropdowns();

      this.showToast(
        `Member ${member.name} status updated to ${newStatus}`,
        "success"
      );

    } catch (error) {
      console.error("Member status update failed:", error);
      this.showToast(error.message || "Unable to update member status", "error");
    }
  }


  updateCalculatedDueDate() {
    const issueDateVal = document.getElementById("issueDate").value;
    const days = parseInt(document.getElementById("issueDays").value) || 14;

    if (issueDateVal) {
      const issueD = new Date(issueDateVal);
      issueD.setDate(issueD.getDate() + days);
      document.getElementById("dueDate").value = issueD.toISOString().split('T')[0];
    }
  }

  
  async handleIssueBook(e) {
    e.preventDefault();

    const bookId = document.getElementById("issueSelectBook").value;
    const memberId = document.getElementById("issueSelectMember").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!bookId || !memberId) {
      this.showToast("Please select both a book and a member", "error");
      return;
    }

    try {
      await this.apiRequest("/api/transactions/issue", {
        method: "POST",
        body: JSON.stringify({ bookId, memberId, dueDate })
      });

      const [booksData, transactionsData] = await Promise.all([
        this.apiRequest("/api/books"),
        this.apiRequest("/api/transactions")
      ]);

      this.books = booksData.data || [];
      this.transactions = transactionsData.data || [];

      const book = this.books.find(b => b.id === bookId);
      const member = this.members.find(m => m.id === memberId);

      this.updateDashboardStats();
      this.renderCatalogue();
      this.renderRecentTransactions();
      this.renderFullTransactions();
      this.populateDropdowns();

      this.showToast(`Book '${book?.title}' issued to ${member?.name}`, "success");
      this.addNotification(`Book '${book?.title}' issued to ${member?.name}`);

    } catch (error) {
      console.error("Book issue failed:", error);
      this.showToast(error.message || "Unable to issue book", "error");
    }
  }


  updateReturnFinePreview() {
    const txId = document.getElementById("returnSelectTransaction").value;
    const returnDateVal = document.getElementById("returnDate").value;

    if (!txId || !returnDateVal) {
      document.getElementById("overdueDaysCount").textContent = "0 Days";
      document.getElementById("calculatedFineAmount").textContent = "$0.00";
      return;
    }

    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) return;

    const dueD = new Date(tx.dueDate);
    const returnD = new Date(returnDateVal);

    const timeDiff = returnD.getTime() - dueD.getTime();
    const overdueDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    const fine = overdueDays * 1.00;

    document.getElementById("overdueDaysCount").textContent = `${overdueDays} Days`;
    document.getElementById("calculatedFineAmount").textContent = `$${fine.toFixed(2)}`;
  }

  
  async handleReturnBook(e) {
    e.preventDefault();

    const txId = document.getElementById("returnSelectTransaction").value;

    if (!txId) {
      this.showToast("Please select an active issue transaction", "error");
      return;
    }

    try {
      await this.apiRequest(`/api/transactions/return/${txId}`, {
        method: "PUT"
      });

      const [booksData, transactionsData] = await Promise.all([
        this.apiRequest("/api/books"),
        this.apiRequest("/api/transactions")
      ]);

      this.books = booksData.data || [];
      this.transactions = transactionsData.data || [];

      this.updateDashboardStats();
      this.renderCatalogue();
      this.renderRecentTransactions();
      this.renderFullTransactions();
      this.renderFines();
      this.populateDropdowns();

      this.showToast("Book returned successfully!", "success");

    } catch (error) {
      console.error("Book return failed:", error);
      this.showToast(error.message || "Unable to return book", "error");
    }
  }


  renderRecentTransactions() {
    const body = document.getElementById("recentTransTableBody");
    const recent = this.transactions.slice(0, 5);

    body.innerHTML = recent.map(t => `
      <tr>
        <td><strong>${t.bookTitle}</strong></td>
        <td>${t.memberName}</td>
        <td>${t.issueDate}</td>
        <td>${t.dueDate}</td>
        <td><span class="badge-status ${t.status.toLowerCase()}">${t.status}</span></td>
      </tr>
    `).join('');
  }

  renderFullTransactions() {
    const body = document.getElementById("fullTransactionTableBody");
    body.innerHTML = this.transactions.map(t => `
      <tr>
        <td><code>${t.id}</code></td>
        <td><strong>${t.bookTitle}</strong></td>
        <td>${t.memberName}</td>
        <td>${t.issueDate}</td>
        <td>${t.dueDate}</td>
        <td>${t.returnDate || '<span class="text-warning">On Loan</span>'}</td>
        <td>${t.fineAmount > 0 ? `<span class="text-danger">$${t.fineAmount.toFixed(2)}</span>` : '$0.00'}</td>
        <td><span class="badge-status ${t.status.toLowerCase()}">${t.status}</span></td>
      </tr>
    `).join('');
  }

  renderFines() {
    const body = document.getElementById("finesTableBody");
    const fineRecords = this.transactions.filter(t => t.fineAmount > 0 || t.status === "Overdue");

    if (fineRecords.length === 0) {
      body.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No overdues or active fines. Excellent!</td></tr>`;
      return;
    }

    body.innerHTML = fineRecords.map(t => `
      <tr>
        <td><strong>${t.memberName}</strong></td>
        <td>${t.bookTitle}</td>
        <td>${t.dueDate}</td>
        <td><strong class="text-warning">${t.status === "Overdue" ? "Active Overdue" : "Late Return"}</strong></td>
        <td><strong class="text-danger">$${t.fineAmount.toFixed(2)}</strong></td>
        <td><span class="badge-status ${t.finePaid ? 'paid' : 'unpaid'}">${t.finePaid ? 'Paid' : 'Unpaid'}</span></td>
        <td>
          ${!t.finePaid ? `<button class="btn success" style="padding:0.4rem 0.8rem;" onclick="app.payFine('${t.id}')">Collect Payment</button>` : '<span class="text-success"><i data-lucide="check"></i> Cleared</span>'}
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  
  async payFine(txId) {
    try {
      await this.apiRequest(`/api/transactions/pay-fine/${txId}`, {
        method: "PUT"
      });

      const transactionsData = await this.apiRequest("/api/transactions");
      this.transactions = transactionsData.data || [];

      this.renderFines();
      this.updateDashboardStats();
      this.renderMembers();
      this.renderRecentTransactions();
      this.renderFullTransactions();

      this.showToast("Fine payment recorded successfully", "success");

    } catch (error) {
      console.error("Fine payment failed:", error);
      this.showToast(error.message || "Unable to record fine payment", "error");
    }
  }


  playBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
    }
  }

  mapCategory(rawCategory) {
    if (!rawCategory) return "Fiction";
    const cat = String(rawCategory).toLowerCase();
    if (cat.includes("computer") || cat.includes("software") || cat.includes("program") || cat.includes("code") || cat.includes("tech")) {
      return "Computer Science";
    }
    if (cat.includes("math")) return "Mathematics";
    if (cat.includes("science") || cat.includes("physics") || cat.includes("chem") || cat.includes("bio") || cat.includes("astronomy")) {
      return "Science";
    }
    if (cat.includes("history") || cat.includes("biography") || cat.includes("memoir") || cat.includes("civilization")) {
      return "History";
    }
    if (cat.includes("philosoph") || cat.includes("ethics") || cat.includes("logic")) {
      return "Philosophy";
    }
    if (cat.includes("fiction") || cat.includes("novel") || cat.includes("literature") || cat.includes("fantasy") || cat.includes("classic")) {
      return "Fiction";
    }
    return rawCategory;
  }

  ensureCategoryExists(categoryName) {
    if (!categoryName) return;
    const bookCategorySelect = document.getElementById("bookCategoryInput");
    if (bookCategorySelect) {
      const exists = Array.from(bookCategorySelect.options).some(
        opt => opt.value.toLowerCase() === categoryName.toLowerCase()
      );
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = categoryName;
        opt.textContent = categoryName;
        bookCategorySelect.appendChild(opt);

        const filterSelect = document.getElementById("categoryFilter");
        if (filterSelect) {
          const fOpt = document.createElement("option");
          fOpt.value = categoryName;
          fOpt.textContent = categoryName;
          filterSelect.appendChild(fOpt);
        }
      }
    }
  }

  async fetchBookFromIsbnDatabase(rawCode) {
    if (!rawCode) return null;
    const cleanCode = String(rawCode).replace(/[^0-9X]/gi, "").trim();
    if (!cleanCode) return null;

    let result = null;

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.totalItems > 0 && data.items && data.items.length > 0) {
          const item = data.items[0];
          const info = item.volumeInfo || {};

          const isbn13Obj = info.industryIdentifiers?.find(id => id.type === "ISBN_13");
          const isbn10Obj = info.industryIdentifiers?.find(id => id.type === "ISBN_10");

          let coverUrl = "";
          if (info.imageLinks?.thumbnail) {
            coverUrl = info.imageLinks.thumbnail.replace("http://", "https://");
          } else if (info.imageLinks?.smallThumbnail) {
            coverUrl = info.imageLinks.smallThumbnail.replace("http://", "https://");
          } else {
            coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanCode}-L.jpg?default=false`;
          }

          result = {
            title: info.title || "Unknown Title",
            subtitle: info.subtitle || "",
            author: (info.authors && info.authors.length > 0) ? info.authors.join(", ") : "Unknown Author",
            authors: info.authors || [],
            publisher: info.publisher || "Publisher not specified",
            publishedDate: info.publishedDate || "Unknown date",
            description: info.description ? info.description.replace(/<[^>]*>?/gm, '') : "No synopsis available in global ISBN records.",
            category: (info.categories && info.categories.length > 0) ? this.mapCategory(info.categories[0]) : "General",
            pageCount: info.pageCount || null,
            language: info.language ? info.language.toUpperCase() : "EN",
            isbn: isbn13Obj ? isbn13Obj.identifier : (isbn10Obj ? isbn10Obj.identifier : cleanCode),
            isbn13: isbn13Obj ? isbn13Obj.identifier : cleanCode,
            isbn10: isbn10Obj ? isbn10Obj.identifier : "",
            barcode: isbn13Obj ? isbn13Obj.identifier : cleanCode,
            cover: coverUrl,
            previewLink: info.previewLink || info.infoLink || `https://books.google.com/books?isbn=${cleanCode}`,
            source: "Google Books API"
          };
        }
      }
    } catch (err) {
      console.warn("Google Books API query failed, trying Open Library fallback...", err);
    }

    if (!result) {
      try {
        const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanCode}&format=json&jscmd=data`);
        if (olRes.ok) {
          const olData = await olRes.json();
          const key = `ISBN:${cleanCode}`;
          if (olData[key]) {
            const item = olData[key];
            const authorNames = item.authors ? item.authors.map(a => a.name).join(", ") : "Unknown Author";
            const publisher = item.publishers ? item.publishers.map(p => p.name).join(", ") : "Publisher not specified";
            const cover = item.cover?.large || item.cover?.medium || `https://covers.openlibrary.org/b/isbn/${cleanCode}-L.jpg`;
            const rawCat = item.subjects && item.subjects.length > 0 ? item.subjects[0].name : "General";

            result = {
              title: item.title || "Unknown Title",
              subtitle: item.subtitle || "",
              author: authorNames,
              authors: item.authors ? item.authors.map(a => a.name) : [],
              publisher: publisher,
              publishedDate: item.publish_date || "Unknown date",
              description: typeof item.notes === "string" ? item.notes : (item.description || "No synopsis available in global ISBN records."),
              category: this.mapCategory(rawCat),
              pageCount: item.number_of_pages || null,
              language: "EN",
              isbn: cleanCode,
              isbn13: cleanCode,
              isbn10: "",
              barcode: cleanCode,
              cover: cover,
              previewLink: item.url || `https://openlibrary.org/isbn/${cleanCode}`,
              source: "Open Library API"
            };
          }
        }
      } catch (olErr) {
        console.warn("Open Library fallback failed", olErr);
      }
    }

    return result;
  }

  async scanAndLookupIsbn(rawBarcode) {
    if (!rawBarcode) return;
    const cleanCode = String(rawBarcode).replace(/[^0-9X]/gi, "").trim();

    this.playBeep();
    document.getElementById("detectedBarcodeValue").textContent = rawBarcode;
    
    if (cleanCode) this.initBarcodeCanvas(cleanCode);

    const infoBox = document.getElementById("matchedBookInfo");
    const loader = document.getElementById("isbnLookupLoading");
    const sourceBadge = document.getElementById("scannerSourceBadge");

    loader?.classList.remove("hidden");
    infoBox?.classList.add("hidden");
    sourceBadge?.classList.add("hidden");

    const localBook = this.books.find(b => 
      b.barcode === cleanCode || 
      b.barcode === rawBarcode || 
      b.isbn.replace(/[^0-9X]/gi, "") === cleanCode ||
      b.isbn === rawBarcode
    );

    let isbnBook = null;
    try {
      isbnBook = await this.fetchBookFromIsbnDatabase(cleanCode || rawBarcode);
    } catch (err) {
      console.error("ISBN database fetch error", err);
    }

    loader?.classList.add("hidden");

    let displayBook = null;
    let isInLibrary = !!localBook;

    if (isbnBook) {
      displayBook = {
        ...isbnBook,
        id: localBook ? localBook.id : null,
        availability: localBook ? localBook.availability : "Not Catalogued",
        localCover: localBook?.cover || null
      };
      if (sourceBadge) {
        sourceBadge.innerHTML = `<i data-lucide="globe"></i> ${isbnBook.source}`;
        sourceBadge.classList.remove("hidden");
      }
    } else if (localBook) {
      displayBook = {
        title: localBook.title,
        subtitle: "",
        author: localBook.author,
        publisher: "Library Collection",
        publishedDate: "Catalogued",
        description: "Registered book in SmartLib catalogue.",
        category: localBook.category,
        pageCount: null,
        language: "EN",
        isbn: localBook.isbn,
        barcode: localBook.barcode,
        cover: localBook.cover,
        id: localBook.id,
        availability: localBook.availability,
        previewLink: null,
        source: "Local Inventory"
      };
    }

    if (!displayBook) {
      infoBox.className = "matched-book-info margin-top-sm";
      infoBox.innerHTML = `
        <div class="matched-book-card">
          <div style="padding: 1rem; text-align: center;">
            <i data-lucide="help-circle" style="width:40px;height:40px;color:var(--accent-warning);margin-bottom:0.5rem;"></i>
            <h4 style="color:var(--text-main); margin-bottom:0.3rem;">No ISBN Database Record Found</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
              Barcode <code>${rawBarcode}</code> was scanned successfully, but no matching book was found in Google Books or Open Library.
            </p>
            <button class="btn primary" onclick="app.openBookModalWithData({ barcode: '${cleanCode || rawBarcode}', isbn: '${rawBarcode}' })">
              <i data-lucide="plus"></i> Add Book Manually to Library
            </button>
          </div>
        </div>
      `;
      infoBox.classList.remove("hidden");
      this.showToast(`No online record found for barcode ${rawBarcode}`, "info");
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    if (displayBook.category) {
      this.ensureCategoryExists(displayBook.category);
    }

    const coverSrc = displayBook.cover || displayBook.localCover;
    const statusClass = isInLibrary ? displayBook.availability.toLowerCase() : "pending";
    const statusText = isInLibrary ? `In Collection (${displayBook.availability})` : "New Book (From ISBN DB)";

    infoBox.className = "matched-book-info margin-top-sm";
    infoBox.innerHTML = `
      <div class="matched-book-card">
        <div class="matched-book-grid">
          <div class="matched-cover-wrap">
            ${coverSrc ? 
              `<img src="${coverSrc}" alt="${displayBook.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="cover-fallback" style="${coverSrc ? 'display:none;' : ''}">
              <i data-lucide="book-open" style="width:32px;height:32px;"></i>
              <span>SmartLib</span>
            </div>
          </div>
          
          <div class="matched-meta-content">
            <h3 class="matched-title">${displayBook.title}</h3>
            ${displayBook.subtitle ? `<p class="matched-subtitle">${displayBook.subtitle}</p>` : ''}
            <div class="matched-author">
              <i data-lucide="user"></i> <span>${displayBook.author}</span>
            </div>

            <div class="matched-tags">
              <span class="meta-chip"><strong>Category:</strong> ${displayBook.category}</span>
              ${displayBook.publisher ? `<span class="meta-chip"><strong>Publisher:</strong> ${displayBook.publisher}</span>` : ''}
              ${displayBook.publishedDate ? `<span class="meta-chip"><strong>Year:</strong> ${displayBook.publishedDate.slice(0, 4)}</span>` : ''}
              ${displayBook.pageCount ? `<span class="meta-chip"><strong>Pages:</strong> ${displayBook.pageCount}</span>` : ''}
              ${displayBook.language ? `<span class="meta-chip"><strong>Lang:</strong> ${displayBook.language}</span>` : ''}
              <span class="meta-chip"><strong>ISBN:</strong> ${displayBook.isbn}</span>
            </div>

            <div class="status-strip ${isInLibrary ? 'in-library' : 'not-in-library'}">
              <span>
                <i data-lucide="${isInLibrary ? 'check-circle-2' : 'sparkles'}"></i>
                ${isInLibrary ? `Catalogued in Library` : `Discovered from ${displayBook.source}`}
              </span>
              <span class="badge-status ${statusClass}">${statusText}</span>
            </div>
          </div>
        </div>

        <div class="matched-synopsis">
          <strong><i data-lucide="align-left"></i> Book Synopsis / Overview:</strong>
          <p>${displayBook.description}</p>
        </div>

        <div class="matched-action-row">
          ${!isInLibrary ? `
            <button class="btn success" id="addScannedBookBtn" style="flex: 1;">
              <i data-lucide="plus-circle"></i> Add to Library Catalogue
            </button>
            <button class="btn secondary" id="editAndAddScannedBookBtn">
              <i data-lucide="edit-3"></i> Edit & Add
            </button>
          ` : `
            ${displayBook.availability === 'Available' ? `
              <button class="btn success" id="quickIssueScannedBtn" style="flex: 1;">
                <i data-lucide="arrow-up-right"></i> Issue This Book
              </button>
            ` : `
              <button class="btn warning" id="quickReturnScannedBtn" style="flex: 1;">
                <i data-lucide="arrow-down-left"></i> Return This Book
              </button>
            `}
            <button class="btn secondary" id="viewInCatalogueBtn">
              <i data-lucide="library"></i> View in Catalogue
            </button>
          `}

          ${displayBook.previewLink ? `
            <a href="${displayBook.previewLink}" target="_blank" rel="noopener noreferrer" class="btn secondary" title="View on Web / Google Books">
              <i data-lucide="external-link"></i> Web Preview
            </a>
          ` : ''}
        </div>
      </div>
    `;

    infoBox.classList.remove("hidden");

    if (!isInLibrary) {
      document.getElementById("addScannedBookBtn")?.addEventListener("click", async () => {
        await this.addScannedBookToLibrary(displayBook);
      });
      document.getElementById("editAndAddScannedBookBtn")?.addEventListener("click", () => {
        this.openBookModalWithData(displayBook);
      });
      this.showToast(`Scanned: "${displayBook.title}" retrieved from ISBN database!`, "success");
    } else {
      document.getElementById("quickIssueScannedBtn")?.addEventListener("click", () => {
        this.switchTab("issue-return");
        document.getElementById("issueSelectBook").value = displayBook.id;
      });
      document.getElementById("quickReturnScannedBtn")?.addEventListener("click", () => {
        this.switchTab("issue-return");
        const activeTx = this.transactions.find(t => t.bookId === displayBook.id && t.returnDate === null);
        if (activeTx) {
          document.getElementById("returnSelectTransaction").value = activeTx.id;
          this.updateReturnFinePreview();
        }
      });
      document.getElementById("viewInCatalogueBtn")?.addEventListener("click", () => {
        this.switchTab("catalogue");
        document.getElementById("catalogueSearchInput").value = displayBook.barcode;
        this.renderCatalogue(displayBook.barcode);
      });
      this.showToast(`"${displayBook.title}" is in library collection (${displayBook.availability})`, "info");
    }

    if (window.lucide) window.lucide.createIcons();
  }

  async autoFillModalFromIsbn(rawCode) {
    if (!rawCode) {
      this.showToast("Please enter an ISBN or barcode to auto-fill", "error");
      return;
    }

    const loader = document.getElementById("modalIsbnLoading");
    loader?.classList.remove("hidden");

    try {
      const bookData = await this.fetchBookFromIsbnDatabase(rawCode);
      loader?.classList.add("hidden");

      if (!bookData) {
        this.showToast(`No book record found in ISBN database for "${rawCode}"`, "error");
        return;
      }

      this.playBeep();
      document.getElementById("bookTitleInput").value = bookData.title || "";
      document.getElementById("bookAuthorInput").value = bookData.author || "";
      
      const mappedCat = this.mapCategory(bookData.category);
      this.ensureCategoryExists(mappedCat);
      document.getElementById("bookCategoryInput").value = mappedCat;

      document.getElementById("bookIsbnInput").value = bookData.isbn13 || bookData.isbn || rawCode;
      document.getElementById("bookBarcodeInput").value = bookData.barcode || bookData.isbn13 || rawCode;
      document.getElementById("bookCoverInput").value = bookData.cover || "";

      if (bookData.cover) {
        const coverImg = document.getElementById("modalCoverImg");
        coverImg.src = bookData.cover;
        document.getElementById("modalPreviewTitle").textContent = bookData.title;
        document.getElementById("modalPreviewMeta").textContent = `${bookData.author} • ${mappedCat}`;
        document.getElementById("modalCoverSource").innerHTML = `<i data-lucide="globe"></i> ${bookData.source || 'ISBN DB'}`;
        document.getElementById("modalCoverPreview")?.classList.remove("hidden");
      }

      this.showToast(`Auto-filled "${bookData.title}" from ${bookData.source}!`, "success");
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      loader?.classList.add("hidden");
      console.error(err);
      this.showToast("Failed to connect to ISBN database", "error");
    }
  }

  
async addScannedBookToLibrary(bookData) {
  const barcode = bookData.barcode || bookData.isbn13 || bookData.isbn;
  const isbn = bookData.isbn13 || bookData.isbn || barcode;

  const existing = this.books.find(
    b => b.barcode === barcode || b.isbn === isbn
  );

  if (existing) {
    this.showToast(
      `"${existing.title}" is already in your library!`,
      "info"
    );
    return existing;
  }

  const mappedCat = this.mapCategory(bookData.category);
  this.ensureCategoryExists(mappedCat);

  try {
    const result = await this.apiRequest("/api/books", {
      method: "POST",
      body: JSON.stringify({
        title: bookData.title,
        author: bookData.author,
        category: mappedCat,
        isbn,
        barcode,
        availability: "Available",
        cover: bookData.cover || ""
      })
    });

    const newBook = result.data;

    this.books.unshift(newBook);

    this.renderCatalogue();
    this.updateDashboardStats();
    this.populateDropdowns();
    this.renderTestBarcodes();

    this.addNotification(
      `New book "${newBook.title}" added through ISBN lookup`
    );

    this.showToast(
      `"${newBook.title}" successfully added to library!`,
      "success"
    );

    return newBook;

  } catch (error) {
    console.error("ISBN book save failed:", error);
    this.showToast(
      error.message || "Unable to save book to database",
      "error"
    );
    return null;
  }
}


  openBookModalWithData(bookData) {
    this.openBookModal();
    document.getElementById("bookTitleInput").value = bookData.title || "";
    document.getElementById("bookAuthorInput").value = bookData.author || "";
    
    if (bookData.category) {
      const mapped = this.mapCategory(bookData.category);
      this.ensureCategoryExists(mapped);
      document.getElementById("bookCategoryInput").value = mapped;
    }

    document.getElementById("bookIsbnInput").value = bookData.isbn || bookData.barcode || "";
    document.getElementById("bookBarcodeInput").value = bookData.barcode || bookData.isbn || "";
    document.getElementById("bookCoverInput").value = bookData.cover || "";

    if (bookData.cover) {
      document.getElementById("modalCoverImg").src = bookData.cover;
      document.getElementById("modalPreviewTitle").textContent = bookData.title || "Book Title";
      document.getElementById("modalPreviewMeta").textContent = `${bookData.author || ''} • ${bookData.category || ''}`;
      document.getElementById("modalCoverPreview")?.classList.remove("hidden");
    }
  }

  async handleBarcodeImageUpload(file) {
    if (!file) return;
    this.showToast(`Decoding barcode from "${file.name}"...`, "info");
    try {
      const scanner = new Html5Qrcode("interactiveReader");
      const decodedText = await scanner.scanFile(file, true);
      this.playBeep();
      this.showToast(`Barcode detected: ${decodedText}! Searching ISBN database...`, "success");
      await this.scanAndLookupIsbn(decodedText);
    } catch (err) {
      console.error("Barcode image decode error", err);
      this.showToast("Could not detect a clear barcode in this photo. Try another image or enter the ISBN manually.", "error");
    }
  }

  initBarcodeCanvas(textVal) {
    try {
      JsBarcode("#barcodeCanvas", textVal, {
        format: "CODE128",
        lineColor: "#0f172a",
        width: 2,
        height: 80,
        displayValue: true
      });
    } catch (e) {
    }
  }

  simulateTestScan(barcode) {
    this.scanAndLookupIsbn(barcode);
  }

  renderTestBarcodes() {
    const container = document.getElementById("testBarcodesContainer");
    const testSamples = [
      { title: "Clean Code", isbn: "9780132350884", author: "Robert C. Martin" },
      { title: "The Pragmatic Programmer", isbn: "9780201616224", author: "Andrew Hunt" },
      { title: "Design Patterns", isbn: "9780201633610", author: "Gang of Four" },
      { title: "Sapiens: A Brief History", isbn: "9780062316097", author: "Yuval Noah Harari" },
      { title: "1984", isbn: "9780451524935", author: "George Orwell" },
      { title: "Atomic Habits", isbn: "9780735211292", author: "James Clear" },
      { title: "The Hobbit", isbn: "9780547928227", author: "J.R.R. Tolkien" },
      { title: "The C Programming Language", isbn: "9780131103627", author: "Kernighan & Ritchie" }
    ];

    container.innerHTML = testSamples.map(s => {
      const isAlreadyInLib = this.books.some(b => b.barcode === s.isbn || b.isbn.replace(/[^0-9X]/gi, '') === s.isbn);
      return `
        <div class="test-barcode-chip" onclick="app.scanAndLookupIsbn('${s.isbn}')" title="Click to simulate scan and fetch from ISBN database">
          <strong>${s.title}</strong><br>
          <span style="font-size:0.72rem; color:var(--text-dim);">${s.author}</span><br>
          <code>${s.isbn}</code>
          <div style="margin-top: 4px;">
            <span class="badge-status ${isAlreadyInLib ? 'available' : 'pending'}" style="font-size:0.65rem;">
              ${isAlreadyInLib ? 'In Library' : 'New ISBN'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  
async startCameraScanner() {
  const startBtn = document.getElementById("startCamBtn");
  const stopBtn = document.getElementById("stopCamBtn");

  startBtn?.classList.add("hidden");
  stopBtn?.classList.remove("hidden");

  try {
    let formats = undefined;

    if (window.Html5QrcodeSupportedFormats) {
      formats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE
      ];
    }

    this.html5QrCode = new Html5Qrcode(
      "interactiveReader",
      formats ? { formatsToSupport: formats, verbose: false } : false
    );

    const config = {
      fps: 10,
      qrbox: { width: 280, height: 160 }
    };

    const onScanSuccess = (decodedText) => {
      this.scanAndLookupIsbn(decodedText);
      this.stopCameraScanner();
    };

    try {
      // First try the rear camera.
      await this.html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess
      );
    } catch (firstError) {
      console.warn("Rear camera unavailable. Trying another camera.", firstError);

      // Fall back to an available camera.
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("No camera was detected on this device.");
      }

      await this.html5QrCode.start(
        cameras[0].id,
        config,
        onScanSuccess
      );
    }

  } catch (error) {
    console.error("Camera startup error:", error);

    this.showToast(
      error.message || "Unable to start camera. Check browser permissions.",
      "error"
    );

    startBtn?.classList.remove("hidden");
    stopBtn?.classList.add("hidden");
  }
}


  stopCameraScanner() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode.clear();
        document.getElementById("startCamBtn").classList.remove("hidden");
        document.getElementById("stopCamBtn").classList.add("hidden");
      }).catch(err => console.error(err));
    }
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new LibraryApp();
});