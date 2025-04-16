import React, { useState } from 'react';
import './homepage.css';

const DS = () => {
  interface Tag {
    id: number;
    name: string;
    isChecked?: boolean,
  }

  interface List {
    id: number;
    name: string;
    tags: Tag[];
    isAddingTag?: boolean;
    newTagName?: string;
  }

  const [list, setList] = useState<List[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isHovered, setIsHovered] = useState<number | null>(null);
  // const [isChecked, setIsChecked] = useState(false)
  const [draggedTag, setDraggedTag] = useState<{
    listId: number;
    tagId: number;
  } | null>(null);

  const [draggedListId, setDraggedListId] = useState<number | null>(null);

  const handleAddClick = () => setIsAdding(true);

  const handleAddList = () => {
    if (newListName.trim() === '') return;
    const newList: List = {
      id: Date.now(),
      name: newListName,
      tags: [],
      isAddingTag: false,
      newTagName: ''
    };
    setList([...list, newList]);
    setNewListName('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewListName('');
    setIsAdding(false);
    setList(prev =>
      prev.map(l => ({
        ...l,
        isAddingTag: false,
        newTagName: ''
      }))
    );
  };

  const handleListChange = (id: number, name: string) => {
    setList(prev =>
      prev.map(l => (l.id === id ? { ...l, name } : l))
    );
  };

  const handleAddTagClick = (listId: number) => {
    setList(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, isAddingTag: true } : l
      )
    );
  };

  const handleTagNameChange = (listId: number, value: string) => {
    setList(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, newTagName: value } : l
      )
    );
  };

  const handleAddTag = (listId: number) => {
    setList(prev =>
      prev.map(l => {
        if (l.id === listId && l.newTagName?.trim()) {
          const newTag: Tag = {
            id: Date.now(),
            name: l.newTagName,
            isChecked: false,
          };
          return {
            ...l,
            tags: [...l.tags, newTag],
            newTagName: '',
            isAddingTag: false,

          };
        }
        return l;
      })
    );
  };

  const handleTagChange = (listId: number, tagId: number, value: string) => {
    setList(prev =>
      prev.map(l => {
        if (l.id === listId) {
          const updatedTags = l.tags.map(t =>
            t.id === tagId ? { ...t, name: value } : t
          );
          return { ...l, tags: updatedTags };
        }
        return l;
      })
    );
  };
  const handleTagCheckboxToggle = (listId: number, tagId: number) => {
    setList(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedTags = list.tags.map(tag =>
            tag.id === tagId ? { ...tag, isChecked: !tag.isChecked } : tag
          );
          return { ...list, tags: updatedTags };
        }
        return list;
      })
    );
  };
  const handleDragStart = (listId: number, tagId: number) => {
    setDraggedTag({ listId, tagId });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (listId: number, targetTagId: number) => {
    if (!draggedTag || draggedTag.listId !== listId) return;

    setList(prev =>
      prev.map(list => {
        if (list.id !== listId) return list;

        const draggedIndex = list.tags.findIndex(t => t.id === draggedTag.tagId);
        const targetIndex = list.tags.findIndex(t => t.id === targetTagId);

        if (draggedIndex === -1 || targetIndex === -1) return list;

        const newTags = [...list.tags];
        const [draggedItem] = newTags.splice(draggedIndex, 1);
        newTags.splice(targetIndex, 0, draggedItem);

        return { ...list, tags: newTags };
      })
    );

    setDraggedTag(null);
  };

  const handleListDragStart = (listId: number) => {
    setDraggedListId(listId)
  }

  const handleListDrop = (targetListId: number) => {
    if (draggedListId === null || draggedListId === targetListId) return;

    setList(prev => {
      const draggedIndex = prev.findIndex(list => list.id === draggedListId);
      const targetIndex = prev.findIndex(list => list.id === targetListId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newList = [...prev];
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);

      return newList;
    });

    setDraggedListId(null);
  };
  return (
    <div className="container">
      {list.map(listItem => (
        <div className="box" key={listItem.id}
          draggable
          onDragStart={() => handleListDragStart(listItem.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleListDrop(listItem.id)}
        >
          <div>
            <input
              type="text"
              value={listItem.name}
              onChange={e => handleListChange(listItem.id, e.target.value)
              }
            />
            <br />
            {listItem.tags.map(tag => (
              <div
                key={tag.id}
                className="tag"
                draggable
                onDragStart={() => handleDragStart(listItem.id, tag.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(listItem.id, tag.id)}
                onMouseEnter={() => setIsHovered(tag.id)}
                onMouseLeave={() => setIsHovered(null)}
              >

                <input
                  type="text"
                  className="tag-input"
                  value={tag.name}
                  onChange={e => handleTagChange(listItem.id, tag.id, e.target.value)}
                />
                {isHovered === tag.id && (
                  <input
                    type="checkbox"
                    className="tag-checkbox"
                    checked={tag.isChecked || false}
                    onChange={() => handleTagCheckboxToggle(listItem.id, tag.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            ))}


            {listItem.isAddingTag ? (
              <div className="box-tag">
                <input
                  type="text"
                  placeholder="Nhập tên thẻ"
                  value={listItem.newTagName || ''}
                  onChange={e =>
                    handleTagNameChange(listItem.id, e.target.value)
                  }
                />
                <button onClick={() => handleAddTag(listItem.id)}>Thêm thẻ</button>
                <button onClick={handleCancel}>X</button>
              </div>
            ) : (
              <div className="add">
                <button onClick={() => handleAddTagClick(listItem.id)}>+Thêm thẻ</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {isAdding ? (
        <div className="box-child">
          <input
            type="text"
            placeholder="Nhập tên danh sách"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
          />
          <button onClick={handleAddList}>Thêm danh sách</button>
          <button onClick={handleCancel}>X</button>
        </div>
      ) : (
        <div className="add">
          <button onClick={handleAddClick}>+Thêm danh sách khác</button>
        </div>
      )}
    </div>
  );
};

export default DS;
