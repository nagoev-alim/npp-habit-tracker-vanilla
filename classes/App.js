import { icons } from 'feather-icons';
import { showNotification } from '../modules/showNotification.js';
import { uid } from '../modules/uid.js';
import logo from '../assets/images/logo.png';

export default class App {
  constructor(root) {
    // 🚀 Props
    this.root = root;
    this.habits = this.storageGet();
    this.habitGlobal = null;

    // 🚀 Render Skeleton
    this.root.innerHTML = `
      <div class='panel'>
        <a href='/' class='logo'>
          <img src='${logo}' alt='Habits' class='logo__ico' />
          <span>Habby</span>
        </a>

        <div class='buttons'>
          <div data-list=''></div>
          <button data-create=''>${icons.plus.toSvg()}</button>
        </div>
      </div>

      <div class='side'>
        <div class='header'>
          <h3 data-habit-name=''>Habit Name</h3>
          <div class='progress'>
            <span class='progress__title'>Progress</span>
            <span class='progress__value' data-progress-value=''>0%</span>
            <div class='progress__meter'>
              <div class='progress__line' data-progress-meter=''></div>
            </div>
          </div>
        </div>
        <div class='body'>
          <ul data-days=''></ul>

          <div class='day day--create'>
            <div class='day__count'>Day 1</div>
            <div class='day__content'>
              <form data-day-form='' class='day__value'>
                <label>
                  <input type='text' name='comment' placeholder='Comment'>
                </label>
                <button>Add</button>
              </form>
            </div>
           </div>
        </div>
      </div>

      <div class='overlay' data-overlay=''>
        <div class='modal'>
          <button class='close' data-close=''>${icons.x.toSvg()}</button>
          <h2 class='title h3'>New habbit</h2>
          <form data-form=''>
            <label>
              <select name='type'>
                <option value=''>Select habit type</option>
                <option value='work'>Work</option>
                <option value='health'>Health</option>
                <option value='sport'>Sport</option>
              </select>
            </label>
            <label>
              <input type='text' name='name' placeholder='Enter habit name'>
            </label>
            <label>
              <input type='number' name='days' step='1' min='1' max='365' placeholder='Enter target days'>
            </label>
            <button type='submit'>Create</button>
          </form>
        </div>
      </div>
    `;

    // 🚀 Query Selectors
    this.DOM = {
      panel: {
        creatBtn: document.querySelector('[data-create]'),
        list: document.querySelector('[data-list]'),
      },
      side: {
        title: document.querySelector('[data-habit-name]'),
        progress: {
          value: document.querySelector('[data-progress-value]'),
          meter: document.querySelector('[data-progress-meter]'),
        },
        days: {
          list: document.querySelector('[data-days]'),
          form: document.querySelector('[data-day-form]'),
        },
      },
      modal: {
        overlay: document.querySelector('[data-overlay]'),
        closeBtn: document.querySelector('[data-close]'),
        form: document.querySelector('.modal [data-form]'),
      },
    };

    // 🚀 Events Listeners
    // Render UI
    const hashID = document.location.hash.replace('#', '');
    const habitUrlID = this.habits.find(h => h.id === hashID);

    // this.rerenderUI(habitUrlID ? habitUrlID.id : this.habits[0].id);
    this.rerenderUI(habitUrlID ? habitUrlID.id : this.habits);

    // Modal Events
    this.DOM.panel.creatBtn.addEventListener('click', this.toggleModal);
    this.DOM.modal.overlay.addEventListener('click', this.toggleModal);
    document.addEventListener('keydown', this.toggleModal);
    this.DOM.modal.form.addEventListener('submit', this.onCreateHabit);
    // Days Events
    this.DOM.side.days.form.addEventListener('submit', this.onDayAdd);
  }

  //===============================================
  // 🚀 Methods
  //===============================================
  /**
   * @function toggleModal - Show/Hide Modal
   * @param target
   * @param key
   */
  toggleModal = ({ target, key }) => {
    if (key === 'Escape' || target.matches('[data-close]') || target.matches('[data-overlay]')) {
      this.DOM.modal.overlay.classList.add('hidden');
      setTimeout(() => this.DOM.modal.overlay.classList.remove('hidden', 'open'), 800);
    } else if (target.matches('[data-create]')) {
      this.DOM.modal.overlay.classList.add('open');
    }
  };

  //===============================================
  /**
   * @function onCreateHabit
   * @param event
   */
  onCreateHabit = (event) => {
    event.preventDefault();
    const form = event.target;
    const { type, name, days } = Object.fromEntries(new FormData(form).entries());

    if (!type || name.trim().length === 0 || days.trim().length === 0) {
      showNotification('warning', 'Please fill the fields.');
      return;
    }

    // Create new habit
    const habit = {
      id: uid(),
      icon: type,
      name,
      target: parseInt(days),
      days: [],
    };

    this.habits = [...this.habits, habit];

    this.habitGlobal = this.habitGlobal === null ? this.habits[0].id : this.habitGlobal;

    // Rerender Days
    this.rerenderUI(this.habitGlobal);

    // Save to local storage
    this.storageSet(this.habits);

    // Reset form
    form.reset();

    // Show notification
    showNotification('success', 'Habit successfully created.');

    // Hide modal
    this.DOM.modal.overlay.classList.add('hidden');
    setTimeout(() => this.DOM.modal.overlay.classList.remove('hidden', 'open'), 800);
  };

  //===============================================
  storageGet = () => {
    return localStorage.getItem('habits') ? JSON.parse(localStorage.getItem('habits')) : [];
  };

  storageSet = (data) => {
    return localStorage.setItem('habits', JSON.stringify(data));
  };

  storageDisplay = () => {
    const habits = this.storageGet();
  };
  //===============================================
  rerenderUI = (habits) => {
    if (Array.isArray(habits) && habits.length === 0) {
      document.querySelector('.side').classList.add('hide');
      return;
    }

    if (Array.isArray(habits) && habits.length !== 0) {
      document.querySelector('.side').classList.remove('hide');
      this.habitGlobal = habits[0].id;
      const activeHabit = this.habits.find(h => h.id === habits[0].id);
      if (!activeHabit) return;
      document.location.replace(`${document.location.pathname}#${activeHabit.id}`);
      this.renderMenu(activeHabit);
      this.renderHeader(activeHabit);
      this.renderDays(activeHabit);
    }

    if (!Array.isArray(habits)) {
      document.querySelector('.side').classList.remove('hide');
      this.habitGlobal = habits;
      const activeHabit = this.habits.find(h => h.id === habits);
      if (!activeHabit) return;
      document.location.replace(`${document.location.pathname}#${activeHabit.id}`);
      this.renderMenu(activeHabit);
      this.renderHeader(activeHabit);
      this.renderDays(activeHabit);
    }


  };
  // rerenderUI = (activeHabitID) => {
  //
  //   this.habitGlobal = activeHabitID;
  //   const activeHabit = this.habits.find(h => h.id === activeHabitID);
  //   if (!activeHabit) {
  //     return;
  //   }
  //   document.location.replace(`${document.location.pathname}#${activeHabit.id}`);
  //   this.renderMenu(activeHabit);
  //   this.renderHeader(activeHabit);
  //   this.renderDays(activeHabit);
  // };

  renderMenu = (activeHabitID) => {
    for (const habit of this.habits) {
      const existed = this.DOM.panel.list.querySelector(`[data-habit-id="${habit.id}"]`);

      if (!existed) {
        const element = document.createElement('button');
        element.setAttribute('data-habit-id', habit.id);
        element.className = `${activeHabitID.id === habit.id ? 'active' : ''}`;
        element.innerHTML = `${icons.file.toSvg()}`;
        element.addEventListener('click', () => this.rerenderUI(habit.id));
        this.DOM.panel.list.append(element);
        continue;
      }

      existed.className = `${activeHabitID.id === habit.id ? 'active' : ''}`;
    }
  };

  renderHeader = (activeHabitID) => {
    const progress = activeHabitID.days.length / activeHabitID.target > 1
      ? 100
      : activeHabitID.days.length / activeHabitID.target * 100;

    this.DOM.side.progress.value.innerHTML = this.DOM.side.progress.meter.style.width = `${progress.toFixed(0)}%`;
    this.DOM.side.title.textContent = activeHabitID.name;
  };

  renderDays = (activeHabitID) => {
    // Clean days HTML
    this.DOM.side.days.list.innerHTML = '';

    // Render days
    for (const day in activeHabitID.days) {
      const element = document.createElement('li');
      element.classList.add('day');
      element.innerHTML = `
        <div class='day__count'>Day ${parseInt(day) + 1}</div>
        <div class='day__content'>
          <div class='day__value'>${activeHabitID.days[day].comment}</div>
          <button data-trash='${day}'>${icons['trash-2'].toSvg()}</button>
        </div>
      `;
      this.DOM.side.days.list.append(element);

      // Find delete button
      const deleteBtn = element.querySelector('[data-trash]');

      // Delete element
      deleteBtn.addEventListener('click', ({ target: { dataset: { trash } } }) => {
        if (confirm('Are you sure?')) {
          this.habits = this.habits.map(h => {
            if (h.id === this.habitGlobal) {
              h.days.splice(parseInt(trash), 1);
              return {
                ...h,
                days: h.days,
              };
            }
            return h;
          });

          // Rerender Days
          this.rerenderUI(this.habitGlobal);

          // Save to local storage
          this.storageSet(this.habits);
        }
      });
    }

    // Set next day value
    document.querySelector('.day--create .day__count').innerHTML = `Day ${activeHabitID.days.length + 1}`;
  };
  //===============================================

  onDayAdd = (event) => {
    event.preventDefault();
    const form = event.target;
    const comment = Object.fromEntries(new FormData(form).entries()).comment.trim();

    if (comment.trim().length === 0) {
      showNotification('warning', 'Please fill the fields.');
      return;
    }

    // Update data
    this.habits = this.habits.map(h => h.id === this.habitGlobal ? { ...h, days: [...h.days, { comment }] } : h);

    // Rerender Days
    this.rerenderUI(this.habitGlobal);

    // Save to local storage
    this.storageSet(this.habits);

    // Reset form
    form.reset();
  };
  //===============================================
}
