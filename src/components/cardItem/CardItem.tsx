import React, { FC, useEffect, useState } from 'react';
import { Modal, Textarea } from '..';
import { ChangeTitleBtns, DeleteButton, TertiaryButton } from '../buttons';

import { useDeleteTaskMutation, useGetUsersQuery, useUpdateTaskMutation } from '../../app/RtkQuery';

import './CardItem.scss';
import { useAppSelector } from '../../app/hooks';
import { Draggable } from 'react-beautiful-dnd';
import { localizationObj } from '../../features/localization';
import { createPortal } from 'react-dom';

interface CardItemProps {
  id: string;
  cardTitle: string;
  cardDescription: string;
  columnId: string;
  boardId: string;
  userId: string;
  order: number;
  index: number;
}

const CardItem: FC<CardItemProps> = ({
  id,
  cardTitle,
  cardDescription,
  order,
  columnId,
  boardId,
  userId: userOwnerId,
  index,
}) => {
  const [taskTitle, setTaskTitle] = useState(cardTitle);
  const [taskDescription, setTaskDescription] = useState(cardDescription);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [isUserChangeModal, setIsUserChangeModal] = useState<boolean>(false);
  const { userId } = useAppSelector((state) => state.userStorage);
  const { lang } = useAppSelector((state) => state.langStorage);
  const { data: users = [] } = useGetUsersQuery('');
  const [userOwner, setUserOwner] = useState<string>('');
  const [isOpenTask, setIsOpenTask] = useState(false);
  const container = document.getElementById('root')!;
  const [isDisplayedTitleTextarea, setIsDisplayedTitleTextarea] = useState(false);
  const [isDisplayedDescrTextarea, setIsDisplayedDescrTextarea] = useState(false);

  const handleTaskTitleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskTitle(event.target.value);
  };

  const handleTaskDescriptionInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(event.target.value);
  };

  const submitTitle = async () => {
    setIsDisplayedTitleTextarea(false);

    await updateTask({
      columnId,
      boardId,
      taskId: id,
      task: {
        title: taskTitle,
        order,
        description: taskDescription,
        userId: userOwnerId,
      },
    });
  };

  const submitDescr = async () => {
    setIsDisplayedDescrTextarea(false);

    await updateTask({
      columnId,
      boardId,
      taskId: id,
      task: {
        title: taskTitle,
        order,
        description: taskDescription,
        userId: userOwnerId,
      },
    });
  };

  const cancelTitle = () => {
    setIsDisplayedTitleTextarea(false);
    setTaskTitle(cardTitle);
  };

  const cancelDescr = () => {
    setIsDisplayedDescrTextarea(false);
    setTaskDescription(cardDescription);
  };

  const closeModal = () => {
    setIsOpenTask(false);
    setActiveModal(false);
    setTaskDescription(cardDescription);
    setTaskTitle(cardTitle);
  };

  const removeTask = async () => {
    await deleteTask({
      boardId,
      columnId,
      taskId: id,
    });
    setActiveModal(false);
  };

  const changeUser = async (newUserId: string) => {
    if (!users.length) return;
    await updateTask({
      columnId,
      boardId,
      taskId: id,
      task: {
        title: cardTitle,
        order,
        description: '2222',
        userId: newUserId,
      },
    });
    setActiveModal(false);
  };

  const openTaskHandler = () => {
    setIsOpenTask(true);
    setActiveModal(true);
  };

  useEffect(() => {
    if (!activeModal) {
      setIsDeleteModal(false);
      setIsUserChangeModal(false);
      setIsOpenTask(false);
      setIsDisplayedTitleTextarea(false);
      setIsDisplayedDescrTextarea(false);
    }
  }, [activeModal]);

  useEffect(() => {
    if (users.length) {
      const userName = users.find((user: { id: string; name: string }) => user.id === userOwnerId);
      setUserOwner(userName ? userName.name : 'Deleted');
    }
  }, [users, userOwnerId]);

  return (
    <>
      <Draggable draggableId={id} index={index}>
        {(provided, snapshot) => (
          <li
            className="board__task"
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            style={{
              boxShadow: snapshot.isDragging ? '0 10px 15px grey' : '',
              background: snapshot.isDragging ? 'white' : '',
              ...provided.draggableProps.style,
            }}
          >
            <>
              <span key={id} className="task">
                <span className="task-text" onClick={openTaskHandler}>
                  {cardTitle}
                </span>
                <span
                  className="task-owner"
                  onClick={() => {
                    setIsUserChangeModal(true);
                    setActiveModal(true);
                  }}
                >
                  {userOwner}
                </span>
                <DeleteButton
                  type="button"
                  id={id}
                  onClick={() => {
                    setActiveModal(true);
                    setIsDeleteModal(true);
                  }}
                />
              </span>
            </>
          </li>
        )}
      </Draggable>

      {createPortal(
        <Modal activeModal={activeModal} setActiveModal={setActiveModal}>
          <>
            {isDeleteModal && (
              <div className="modal__wrapper">
                <div className="modal__img" />
                <div className="modal__text">
                  <h2>{`${localizationObj[lang].doYouWantToDelete} '${cardTitle}' ?`}</h2>
                  <div className="board__column-btns">
                    <button className="button-modal__wrapper" type="button" onClick={removeTask}>
                      <div className="button-modal button__submit" />
                      <div className="button-modal__description">
                        {localizationObj[lang].submit}
                      </div>
                    </button>
                    <button
                      className="button-modal__wrapper"
                      type="button"
                      onClick={() => setActiveModal(false)}
                    >
                      <div className="button-modal button__cancel" />
                      <div className="button-modal__description">
                        {localizationObj[lang].cancel}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isUserChangeModal && (
              <div className="modal__wrapper">
                <div className="modal__img" />
                <div className="modal__text">
                  <h2>{`${localizationObj[lang].doYouWantToChangeUser}`}</h2>
                  <ul className="users-list">
                    {users.map((user: { id: string; name: string }) => (
                      <li
                        key={user.id}
                        onClick={() => {
                          changeUser(user.id);
                        }}
                      >
                        {user.name}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setActiveModal(false)}>
                    {localizationObj[lang].cancel}
                  </button>
                </div>
              </div>
            )}
            {isOpenTask && (
              <div className="modal__wrapper modal__tasks">
                <h3>
                  {`${localizationObj[lang].user}: `}
                  {userOwner}
                </h3>
                <div className="modal__text">
                  {!isDisplayedTitleTextarea && (
                    <>
                      <div className="modal__text-wrapper">
                        <DeleteButton
                          className="btn-edit"
                          type="button"
                          onClick={() => setIsDisplayedTitleTextarea(true)}
                        />
                        <h1 className="modal__tasks-header">
                          {`${localizationObj[lang].yourTask}: `}
                        </h1>
                      </div>
                      <h2>{cardTitle}</h2>
                    </>
                  )}
                  {isDisplayedTitleTextarea && (
                    <>
                      <input
                        className="textarea boards__item-input"
                        placeholder="Change the title"
                        value={taskTitle}
                        onChange={handleTaskTitleInput}
                      />

                      <ChangeTitleBtns onClickSubmit={submitTitle} onClickCancel={cancelTitle} />
                    </>
                  )}
                  {!isDisplayedDescrTextarea && (
                    <>
                      <div className="modal__text-wrapper">
                        <DeleteButton
                          className="btn-edit"
                          type="button"
                          onClick={() => setIsDisplayedDescrTextarea(true)}
                        />
                        <h2>{`${localizationObj[lang].taskDescription}: `}</h2>
                      </div>
                      <p className="modal__tasks-descr">{cardDescription}</p>
                    </>
                  )}

                  {isDisplayedDescrTextarea && (
                    <>
                      <Textarea
                        className="textarea modal__tasks-textarea"
                        cols={4}
                        rows={5}
                        placeholder="Change the description"
                        value={taskDescription}
                        onChange={handleTaskDescriptionInput}
                      />
                      <ChangeTitleBtns onClickSubmit={submitDescr} onClickCancel={cancelDescr} />
                    </>
                  )}
                </div>
                <TertiaryButton
                  className="button__tertiary column__btn"
                  type="button"
                  description="Ok"
                  onClick={closeModal}
                />
              </div>
            )}
          </>
        </Modal>,
        container
      )}
    </>
  );
};

export { CardItem };
