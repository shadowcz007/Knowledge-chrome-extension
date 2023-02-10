import React, { Component } from 'react';
import icon from '../../assets/img/icon-128.png';
import {
  Divider,
  Progress,
  Badge,
  Avatar,
  HoverCard,
  Text,
  Select,
  Flex,
  Button,
  Modal,
  Space,
  MultiSelect,Group,
  Textarea,CopyButton,Alert,Menu,Switch ,Indicator,List, ThemeIcon,Paper,Transition
} from '@mantine/core'

class MultiSelectForTagsComponent extends Component {
  state = {
    _tags: [],
    tags:[],
    userData:{}
  };

  render() {
    let that=this;
    return (
      <div>
        <MultiSelect
            label='标签'
            data={that.state._tags}
            placeholder='选择一个或新建'
            defaultValue={Array.from(that.state.tags, (t) => t.value)}
            searchable
            creatable
            getCreateLabel={(query) => `+ 新建 ${query}`}
            onChange={(newTags) => {
              newTags = newTags.filter((f) => f.trim())
              // console.log(newTags)
              that.setState({
                userData: {
                  ...that.state.userData,
                  tags: newTags,
                },
              })
            }}
            onCreate={(query) => {
              if (query.trim()) {
                const item = { value: query, label: query }
                // 新标签
                if (
                  that.state.tags.filter((t) => t.value != query).length > 0
                ) {
                  that.setState({
                    tags: [item, ...that.state.tags],
                  })
                }

                return item
              }
            }}
          />
      </div>
    );
  }
}

export default MultiSelectForTagsComponent;
